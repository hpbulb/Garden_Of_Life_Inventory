import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function AllProducts() {
  const { products, categories, deleteProduct } = useInventory();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="All Products"
        subtitle="Manage your product inventory"
        action={
          <Link
            to="/add-product"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Add Product
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 table-row-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">
                        📦
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.description?.substring(0, 40)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{product.sku}</td>
                  <td className="px-4 py-3 text-slate-500">{product.category}</td>
                  <td className="px-4 py-3 text-right text-slate-600">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">${product.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        product.stockQuantity <= (product.minStockLevel || 20)
                          ? "font-bold text-red-600"
                          : "text-slate-600"
                      }
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => navigate(`/edit-product/${product.id}`)}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
