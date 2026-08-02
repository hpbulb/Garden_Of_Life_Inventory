import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function StockAdjustment() {
  const { products, addStockAdjustment, stockAdjustments } = useInventory();
  const [formData, setFormData] = useState({
    productId: "",
    type: "in",
    quantity: "",
    reason: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = products.find((p) => p.id === Number(formData.productId));
    if (!product) return;

    await addStockAdjustment({
      productId: product.id,
      productName: product.name,
      type: formData.type,
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
    });

    setFormData({
      productId: "",
      type: "in",
      quantity: "",
      reason: "",
    });
  };

  const recentAdjustments = stockAdjustments.slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Stock Adjustment"
        subtitle="Adjust inventory levels for products"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Adjustment Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">New Adjustment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Product *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Adjustment Type *</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="in"
                    checked={formData.type === "in"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Stock In (+)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="out"
                    checked={formData.type === "out"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Stock Out (-)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="adjustment"
                    checked={formData.type === "adjustment"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Set Exact</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="0"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Reason</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Damaged goods, New shipment, etc."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Apply Adjustment
            </button>
          </form>
        </div>

        {/* Recent Adjustments */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Recent Adjustments</h3>
          {recentAdjustments.length === 0 ? (
            <p className="text-sm text-slate-500">No adjustments recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAdjustments.map((adj) => (
                <div key={adj.id} className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{adj.productName}</p>
                      <p className="text-xs text-slate-500">{adj.reason || "No reason provided"}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          adj.type === "in"
                            ? "font-bold text-emerald-600"
                            : adj.type === "out"
                            ? "font-bold text-red-600"
                            : "font-bold text-amber-600"
                        }
                      >
                        {adj.type === "in" ? "+" : adj.type === "out" ? "-" : "="}
                        {adj.quantity}
                      </span>
                      <p className="text-xs text-slate-400">{new Date(adj.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
