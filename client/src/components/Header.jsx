import { Link } from "react-router-dom";
import { logout } from "../services/users";
import ToggleThemeIcon from "./ui/ToggleThemeIcon";
import reactLogo from "../assets/react.svg";

const Header = ({ handleTheme, user }) => {
  return (
    <header className="flex items-start justify-between p-2">
      <div className="flex items-center justify-center">
        <img src={reactLogo} className="ml-2" alt="React logo" />
        <Link to="/" className="logo">
          <span className="ml-2 text-2xl font-bold">Opportune</span>
        </Link>
      </div>

      <div className="pr-4 gap-4 flex flex-col items-end justify-center sm:flex-row sm:items-center ">
        {user ? 
          (<details className="dropdown">
            <summary className="btn ml-4 bg-gray-500 bg-opacity-20">
              {user.role === 'company' ? user.profile.name : user.profile.firstName}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1 inline-block h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <ul className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
              <li>
                <Link to="/myjobs">{user.role === 'company' ? 'Posted Jobs' : 'My Applications'}</Link>
              </li>
              <li>
                <button onClick={logout}>Sign Out</button>
              </li>
            </ul>
          </details>
          ) : (
            <Link to='/login'>
              <summary className="btn ml-4 bg-gray-500 bg-opacity-20">Login</summary>
            </Link>
          )
        }
        <ToggleThemeIcon handleTheme={handleTheme} />
      </div>
    </header>
  );
};

export default Header;
