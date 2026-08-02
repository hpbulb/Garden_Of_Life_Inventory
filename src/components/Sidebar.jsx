import { NavLink, useLocation } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  {
    name: "Inventory",
    icon: "📦",
    children: [
      { name: "All Products", path: "/products" },
      { name: "Add Product", path: "/add-product" },
      { name: "Categories", path: "/categories" },
      { name: "Stock Adjustment", path: "/stock-adjustment" },
    ],
  },
  {
    name: "Sales",
    icon: "🛒",
    children: [
      { name: "New Sale", path: "/new-sale" },
      { name: "Sales History", path: "/sales-history" },
    ],
  },
  {
    name: "Purchases",
    icon: "📥",
    children: [
      { name: "New Purchase", path: "/new-purchase" },
      { name: "Suppliers", path: "/suppliers" },
    ],
  },
  { name: "Customers", path: "/customers", icon: "👥" },
  { name: "Reports", path: "/reports", icon: "📊" },
  { name: "Notifications", path: "/notifications", icon: "🔔" },
  { name: "Users & Roles", path: "/users", icon: "👤" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
  { name: "Logout", path: "/logout", icon: "🚪" },
];

export default function Sidebar() {
  const { unreadNotifications } = useInventory();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar-scroll flex h-screen w-64 flex-col overflow-y-auto bg-slate-900 text-slate-100">
      <div className="border-b border-slate-700 p-4">
        <h1 className="text-xl font-bold text-emerald-400">Garden of Life</h1>
        <p className="text-xs text-slate-500">Inventory System</p>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          if (item.children) {
            const isParentActive = item.children.some((child) => isActive(child.path));
            return (
              <div key={item.name}>
                <div
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                    isParentActive ? "bg-slate-800 text-emerald-400" : "text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${
                      isActive(child.path)
                        ? "bg-emerald-900/30 text-emerald-400 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                    }`}
                  >
                    <span className="w-4" />
                    <span>{child.name}</span>
                  </NavLink>
                ))}
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                isActive(item.path)
                  ? "bg-emerald-900/30 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === "Notifications" && unreadNotifications > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4 text-center text-xs text-slate-500">
        <p>v1.0.0</p>
      </div>
    </aside>
  );
}
