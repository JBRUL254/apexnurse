import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkStyle =
    "block py-2.5 px-4 rounded hover:bg-blue-100 transition text-gray-700";

  return (
    <aside className="w-56 bg-white border-r h-screen hidden md:block">
      <div className="p-4 font-bold text-lg text-blue-700">Menu</div>
      <nav className="p-2">
        <NavLink to="/dashboard" className={linkStyle}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/home" className={linkStyle}>
          📚 Papers & Series
        </NavLink>
        <NavLink to="/performance" className={linkStyle}>
          📈 Performance
        </NavLink>
        <NavLink to="/settings" className={linkStyle}>
          ⚙️ Settings
        </NavLink>
      </nav>
    </aside>
  );
}
