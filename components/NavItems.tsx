import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sidebarItems } from "../app/constants";
import { logoutUser, getExistingUser, getGooglePicture } from "../app/appwrite/auth";
import { account, avatars } from "../app/appwrite/client";

type User = {
  name?: string;
  email?: string;
  imageUrl?: string;
  imgUrl?: string;
  $id?: string;
};

type NavItemsProps = {
  handleClick?: () => void;
};

const NavItems = ({ handleClick }: NavItemsProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImg, setProfileImg] = useState<string>('');
  const navigate = useNavigate();
  const logOut = async () => {
    await logoutUser();
    navigate("/sign-in");
  };
  // const [img, setImg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const existingUser: User = await account.get();
        console.log('navitmes', existingUser);

        const { providerAccessToken } = (await account.getSession("current")) || {};
        // console.log("storeUserData: providerAccessToken:", providerAccessToken);

        const profilePicture = providerAccessToken
          ? await getGooglePicture(providerAccessToken)
          : null;
        console.log("navitmes: profilePicture:", profilePicture);
        if (!existingUser) {
          setUser(null);
          return;
        }

        const profileImgUrl = profilePicture || avatars.getInitials(existingUser?.name);

        // setImg(profileImgUrl);
        setUser(existingUser)
        setProfileImg(profileImgUrl)
        // setUser(existingUser);
      } catch (e) {
        console.error("Error loading user in NavItems:", e);
      }
    };

    load();
  }, []);
  useEffect(() => {

  }, [user])

  return (
    <section className="nav-items">
      <Link to="/dashoard" className="link-logo">
        <img
          src="/assets/icons/logo.svg"
          alt="Logo"
          className="size-[30px]"
        />
        <h1>Tourvisto</h1>
      </Link>

      <div className="container">
        <nav>
          {sidebarItems.map(({ id, href, icon, label }) => (
            <NavLink key={id} to={href}>
              {({ isActive }) => (
                <div
                  className={`group nav-item ${isActive ? "bg-primary-100 !text-white" : ""
                    }`}
                  onClick={() => handleClick?.()}
                >
                  <img
                    src={icon}
                    alt={label}
                    className={`group-hover:brightness-0  group-hover:invert ${isActive ? "brightness-0 invert" : "text-dark-200"
                      }`}
                  />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <footer className="nav-footer">
          <img src={profileImg} alt={user?.name ?? "User"} />
          <article>
            <h2>{user?.name ?? "Guest"}</h2>
            <p>{user?.email ?? ""}</p>
          </article>
          <button onClick={logOut} className="cursor-pointer">
            <img
              referrerPolicy="no-referrer"
              src="/assets/icons/logout.svg"
              alt="Log Out"
              className="size-6"
            />
          </button>
        </footer>
      </div>
    </section>
  );
};

export default NavItems;
