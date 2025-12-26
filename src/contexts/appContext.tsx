import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getAllUsers, getGooglePicture } from "../../app/appwrite/auth";
import { account, appwriteConfig, avatars, client } from "../../app/appwrite/client";
import { TablesDB } from "appwrite";
import { getAllTrips } from "../../app/appwrite/allTrips";
import { parseMarkdownToJson } from "../../app/lib/utils";


type UserType = {
  $id?: string;
  name: string;
  email?: string;
  imageUrl?: string | null;
} | null;

type TripRecord = {
  $id: string;
  imageUrls?: string[];
  tripDetails?: any;
};

type AppContextType = {
  user: UserType;
  trips: TripRecord[];
  users: UserType[];          // <--- NEW
  loadingUser: boolean;
  loadingTrips: boolean;
  loadingUsers: boolean;       // <--- NEW
};

const AppContext = createContext<AppContextType>({
  user: null,
  trips: [],
  users: [],
  loadingUser: true,
  loadingTrips: true,
  loadingUsers: true,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]); // <--- NEW
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Step 1: Wait for a valid session (retry up to 3 times)
        let session: any = null;
        for (let i = 0; i < 3; i++) {
          session = await account.getSession("current").catch(() => null);
          if (session) break;
          await new Promise((r) => setTimeout(r, 300)); // small delay between retries
        }

        if (!session) {
          setUser(null);
          return;
        }

        // Step 2: Get the authenticated user
        const currentUser = await account.get();

        // Step 3: Fetch providerAccessToken (for Google profile picture)
        const { providerAccessToken } = session || {};
        const profilePicture = providerAccessToken
          ? await getGooglePicture(providerAccessToken)
          : null;
        console.log("providerAccessToken", providerAccessToken);
        console.log("currentUser", currentUser);

        // Step 4: Create user in database if not exist
        const tableDB = new TablesDB(client);
        try {
          await tableDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userCollectionId,
            rowId: currentUser.$id,
            data: {
              accountId: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name,
              imageUrl: profilePicture,
              joinedAt: new Date().toISOString(),
            },
          });
          console.log("User created in DB");
        } catch (err: any) {
          if (!err.message.includes("document already exists")) {
            console.error("Error creating user", err);
          } else {
            console.log("User already exists in DB");
          }
        }

        // Step 5: Fetch all users after creating current user
        await fetchUsers();

        // Step 6: Set user state
        setUser({
          ...currentUser,
          imageUrl: profilePicture || avatars.getInitials(currentUser?.name),
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };


    const fetchTrips = async () => {
      try {
        const response = await getAllTrips();
        const normalizedTrips = (response?.allTrips ?? []).map((trip) => ({
          ...trip,
          tripDetails: parseMarkdownToJson(trip.tripDetails),
        }));
        setTrips(normalizedTrips);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setTrips([]);
      } finally {
        setLoadingTrips(false);
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers(100, 0); // adjust limit & offset as needed
        const formattedUsers = response.users.map((u: any) => ({
          ...u,
          imageUrl: u.imageUrl || avatars.getInitials(u.name),
        }));
        setUsers(formattedUsers);
      } catch (err) {
        console.error("Error fetching all users:", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers()
    fetchUser();
    fetchTrips();
  }, []);

  return (
    <AppContext.Provider value={{ user, trips, users, loadingUser, loadingTrips, loadingUsers }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);