import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function NewPurchase() {
  const { products, suppliers, settings, addPurchase } = useInventory();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [status, setStatus] = useState("received");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      const newQty = existing.quantity + 1;
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.cost,
          total: product.cost,
        },
      ]);
    }
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const taxRate = (settings?.taxRate ?? 0.08) * 100;
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (settings?.taxRate ?? 0.08);
  const total = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add at least one product to the purchase.");
      return;
    }
    if (!selectedSupplier) {
      alert("Please select a supplier.");
      return;
    }

    const supplier = suppliers.find((s) => s.id === Number(selectedSupplier));
    await addPurchase({
      items: cart,
      supplierId: Number(selectedSupplier),
      supplierName: supplier ? supplier.name : "",
      status,
      total: total,
    });

    navigate("/suppliers");
  };

  return (
    <div>
      <PageHeader
        title="New Purchase"
        subtitle="Create a new purchase order"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Product Search */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
          </div>

          {/* Product List */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Cost</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Current Stock</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.slice(0, 10).map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 table-row-hover">
                      <td className="px-4 py-2 font-medium text-slate-800">{product.name}</td>
                      <td className="px-4 py-2 text-slate-500">{product.sku}</td>
                      <td className="px-4 py-2 text-right text-slate-600">${product.cost.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{product.stockQuantity}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => addToCart(product)}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          {/* Cart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Purchase Cart ({cart.length} items)</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">No items in cart.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{item.productName}</p>
                      <p className="text-xs text-slate-500">${item.unitPrice.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="w-12 rounded border border-slate-300 text-center text-sm"
                    />
                    <span className="w-16 text-right font-medium text-slate-800">${item.total.toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Purchase Details</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700">Supplier *</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="received"
                    checked={status === "received"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Received</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="pending"
                    checked={status === "pending"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Pending</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="cancelled"
                    checked={status === "cancelled"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Cancelled</span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Tax ({taxRate.toFixed(0)}%)</span>
                 <span className="text-slate-800">${tax.toFixed(2)}</span>
               </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                <span className="text-slate-800">Total</span>
                <span className="text-emerald-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Complete Purchase
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
