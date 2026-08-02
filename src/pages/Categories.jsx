import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateCategory(editingId, formData);
    } else {
      addCategory(formData);
    }
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        action={
          <button
            onClick={handleNew}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Add Category
          </button>
        }
      />

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            {editingId ? "Edit Category" : "Add New Category"}
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
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-slate-100 table-row-hover">
                  <td className="px-4 py-3 font-medium text-slate-800">{category.name}</td>
                  <td className="px-4 py-3 text-slate-500">{category.description}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
