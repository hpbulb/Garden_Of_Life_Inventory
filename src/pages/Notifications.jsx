import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useInventory();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning": return "⚠️";
      case "sale": return "🛒";
      case "purchase": return "📥";
      default: return "ℹ️";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "warning": return "bg-amber-100 text-amber-800";
      case "sale": return "bg-blue-100 text-blue-800";
      case "purchase": return "bg-purple-100 text-purple-800";
      default: return "bg-emerald-100 text-emerald-800";
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="View all system notifications"
        action={
          notifications.some((n) => !n.read) && (
            <button
              onClick={markAllNotificationsRead}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Mark All Read
            </button>
          )
        }
      />

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <span className="text-4xl">🔔</span>
          <p className="mt-2 text-slate-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 shadow-sm ${
                n.read ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${getNotificationColor(n.type)}`}>
                  <span className="text-xl">{getNotificationIcon(n.type)}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.read ? "text-slate-600" : "font-medium text-slate-800"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(n.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="rounded p-1 text-slate-600 hover:bg-slate-100"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-red-600"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
