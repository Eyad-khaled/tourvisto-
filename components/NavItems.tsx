import { Link, NavLink, useNavigate } from "react-router-dom";
import { sidebarItems } from "../app/constants";
import { useAppContext } from "../src/contexts/appContext";


type NavItemsProps = {
  handleClick?: () => void;
};

const NavItems = ({ handleClick }: NavItemsProps) => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const logOut = async () => {
    await logout();
    navigate("/sign-in");
  };
  // const [img, setImg] = useState("");


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
          <img src={user?.imageUrl || ''} alt={user?.name ?? "User"} />
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
