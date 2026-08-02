import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function Reports() {
  const { sales, purchases, products, lowStockProducts, totalRevenue, totalCost, totalInventoryValue } = useInventory();
  const [activeTab, setActiveTab] = useState("sales");

  const tabs = [
    { id: "sales", name: "Sales Report" },
    { id: "inventory", name: "Inventory Report" },
    { id: "purchases", name: "Purchase Report" },
    { id: "summary", name: "Financial Summary" },
  ];

  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="View business reports and analytics"
      />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sales Report */}
      {activeTab === "sales" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Sales Report</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Sales</p>
              <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-800">{sales.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-slate-800">
                ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Items</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-slate-800">{sale.customerName || "Walk-in Customer"}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{sale.items.length}</td>
                      <td className="px-4 py-2 text-right font-medium text-emerald-600">${sale.total.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{sale.paymentMethod}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === "inventory" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Inventory Report</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Products</p>
              <p className="text-2xl font-bold text-slate-800">{products.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Inventory Value</p>
              <p className="text-2xl font-bold text-emerald-600">${totalInventoryValue.toFixed(2)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Stock</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLowStock = product.stockQuantity <= (product.minStockLevel || 20);
                  return (
                    <tr key={product.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">{product.name}</td>
                      <td className="px-4 py-2 text-slate-500">{product.sku}</td>
                      <td className="px-4 py-2 text-slate-500">{product.category}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{product.stockQuantity}</td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        ${(product.price * product.stockQuantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={
                            isLowStock
                              ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                              : "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"
                          }
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Report */}
      {activeTab === "purchases" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Purchase Report</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Purchases</p>
              <p className="text-2xl font-bold text-purple-600">${purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-800">{purchases.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-slate-800">
                ${purchases.length > 0 ? (purchases.reduce((sum, p) => sum + p.total, 0) / purchases.length).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Supplier</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Items</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No purchase data available.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-slate-500">{new Date(purchase.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-slate-800">{purchase.supplierName}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{purchase.items.length}</td>
                      <td className="px-4 py-2 text-right font-medium text-purple-600">${purchase.total.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={
                            purchase.status === "received"
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"
                              : purchase.status === "pending"
                              ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
                              : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                          }
                        >
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {activeTab === "summary" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Financial Summary</h3>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Cost</p>
              <p className="text-2xl font-bold text-slate-600">${totalCost.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Profit</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                ${totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Profit Margin</p>
              <p className="text-2xl font-bold text-slate-800">{profitMargin}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Revenue Breakdown</p>
              <div className="mt-2 h-4 w-full rounded-full bg-slate-200">
                <div
                  className="h-4 rounded-full bg-emerald-500"
                  style={{ width: `${totalRevenue > 0 ? (totalRevenue / (totalRevenue + totalCost)) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Cost Breakdown</p>
              <div className="mt-2 h-4 w-full rounded-full bg-slate-200">
                <div
                  className="h-4 rounded-full bg-slate-500"
                  style={{ width: `${totalCost > 0 ? (totalCost / (totalRevenue + totalCost)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
