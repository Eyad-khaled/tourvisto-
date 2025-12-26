// import { SidebarComponent } from '@syncfusion/ej2-react-navigations'
// import MobileBar from '../components/MobileBar'
// import './App.css'
// import NavItems from '../components/NavItems'
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
// import {redirect} from 'react-router';
import Dashboard from "../Routes/dashboard";
import AllUsers from "../Routes/all-users";
import SignIn from "../Routes/sign-in";
import { account } from "../app/appwrite/client";
import { getExistingUser, storeUserData } from "../app/appwrite/auth";
import { useEffect, useState } from "react";
import Trips from '../Routes/trips'
// import CreateTrips from '../Routes/createTrips'
import TripDetails from '../Routes/tripDetails'
import { lazy, Suspense } from "react";

const CreateTrips = lazy(() => import("../Routes/createTrips"));
function App() {

  const navigate = useNavigate();
  const location = useLocation();


  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const sessions = await account.listSessions();
        if (sessions?.sessions?.length) {
          const user = await account.get();
          if (user.$id && (location.pathname === "/" || user.$id && location.pathname === "/sign-in")) {
            navigate("/dashboard", { replace: true });
          }
          const existingUser = await getExistingUser(user.$id);
          if (!existingUser?.$id) await storeUserData();
        }
      } catch (e) {
        console.error(e);
        // setTimeout(() => navigate("/sign-in", { replace: true }), 500);
      } finally {
        setLoadingSession(false);
      }
    };

    checkUser();
  }, [location.pathname, navigate]);

  if (loadingSession) return <div>Loading session...</div>;


  return (
    <div className="admin-layout">
      {/* <div className='admin-layout'>
    <MobileBar />
      <aside className="w-full max-w-[270px] hidden lg:block">
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>    */}
      {/* <aside className="children">
        <Outlet />
      </aside> */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/trips/:tripId" element={<TripDetails />} />
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/api/create-trip" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/create" element={<CreateTrips />} />
        </Routes>
      </Suspense>
      {/* </div> */}
    </div>
  );
}

export default App;
