import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

const roles = [
  { value: "admin", label: "Admin", description: "Full access to all features" },
  { value: "manager", label: "Manager", description: "Manage products, sales, and reports" },
  { value: "staff", label: "Staff", description: "View and process sales" },
];

export default function UsersRoles() {
  const { users, addUser, updateUser, deleteUser } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "staff", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateUser(editingId, formData);
    } else {
      await addUser(formData);
    }
    setFormData({ name: "", email: "", role: "staff", password: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role, password: user.password || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", role: "staff", password: "" });
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage user accounts and permissions"
        action={
          <button
            onClick={handleNew}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Add User
          </button>
        }
      />

      {/* Roles Info */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Available Roles</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {roles.map((role) => (
            <div key={role.value} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-800">{role.label}</p>
              <p className="text-xs text-slate-500">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            {editingId ? "Edit User" : "Add New User"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 table-row-hover">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        user.role === "admin"
                          ? "rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800"
                          : user.role === "manager"
                          ? "rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                          : "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
