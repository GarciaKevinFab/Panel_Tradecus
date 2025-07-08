// Sidebar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Importa useNavigate
import { IconContext } from "react-icons";
import navLinks from "../../assets/dummy-data/navLinks";
import urlLogo from "../../assets/dummy-data/imgLogo";
import { FaPowerOff } from "react-icons/fa";
import "./sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate(); // Hook para navegar

  const handleLogout = () => {
    navigate('/login'); // Redirige al usuario a la página de inicio de sesión.
  };

  return (
    <div className="sidebar">
      <div className="sidebar__top">
        <img src={urlLogo} alt="Logo corporativo" />
      </div>

      <div className="sidebar__content">
        <div className="menu">
          <ul className="nav__list">
            {navLinks.map((item, index) => (
              <li className="nav__item" key={index}>
                <NavLink
                  to={item.path}
                  className={(navClass) =>
                    navClass.isActive ? "nav__active nav__link" : "nav__link"
                  }
                >
                  <IconContext.Provider value={{ className: "react-icons" }}>
                    {React.createElement(item.icon)}
                  </IconContext.Provider>
                  {item.display}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar__bottom">
          <span onClick={handleLogout}>
            <FaPowerOff /> Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
