import { useState } from "react";
import { useInventory } from "../context/InventoryContext";

export default function Header() {
  const { notifications, users, markAllNotificationsRead, deleteNotification, unreadNotifications } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const recentNotifications = notifications.slice(0, 5);

  const getNotificationColor = (type) => {
    switch (type) {
      case "warning": return "bg-amber-500/10 text-amber-400";
      case "sale": return "bg-blue-500/10 text-blue-400";
      case "purchase": return "bg-purple-500/10 text-purple-400";
      default: return "bg-emerald-500/10 text-emerald-400";
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
      </div>

      {/* Right: Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
          >
            <span className="text-xl">🔔</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadNotifications > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No notifications</p>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`border-b border-slate-100 px-4 py-2 last:border-0 ${!n.read ? "bg-slate-50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${getNotificationColor(n.type).split(" ")[0].replace("bg-", "bg-")}`} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">{n.message}</p>
                          <p className="text-xs text-slate-400">{new Date(n.date).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <span className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">👤</span>
            <span>{users[0]?.name || "User"}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-200 px-4 py-2">
                <p className="font-semibold">{users[0]?.name || "User"}</p>
                <p className="text-sm text-slate-500">{users[0]?.email || ""}</p>
              </div>
              <div className="py-1">
                <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                <div className="border-t border-slate-200" />
                <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
