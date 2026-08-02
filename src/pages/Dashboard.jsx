import { Link } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  const {
    products, lowStockProducts, totalProducts, totalPurchases,
    totalRevenue, totalInventoryValue, totalCost, sales, settings,
  } = useInventory();

  const recentSales = sales.slice(0, 5);
  const recentProducts = products.slice(0, 5);

  const statCards = [
    { title: "Total Products", value: totalProducts, icon: "📦", color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "💰", color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Total Purchases", value: `$${totalPurchases.toFixed(2)}`, icon: "📥", color: "bg-purple-500/10 text-purple-600" },
    { title: "Inventory Value", value: `$${totalInventoryValue.toFixed(2)}`, icon: "📊", color: "bg-amber-500/10 text-amber-600" },
    { title: "Low Stock Items", value: lowStockProducts.length, icon: "⚠️", color: "bg-red-500/10 text-red-600" },
    { title: "Total Profit", value: `$${(totalRevenue - totalCost).toFixed(2)}`, icon: "📈", color: "bg-teal-500/10 text-teal-600" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${settings.companyName} - Inventory Overview`}
      />

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.color}`}>
                <span className="text-xl">{card.icon}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">{card.title}</p>
                <p className="text-lg font-bold text-slate-800">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Low Stock Alerts</h3>
            <Link to="/stock-adjustment" className="text-sm text-emerald-600 hover:underline">
              View all ({lowStockProducts.length})
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500">All products are sufficiently stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{product.stockQuantity} left</p>
                    <p className="text-xs text-slate-500">Min: {product.minStockLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Recent Sales</h3>
            <Link to="/sales-history" className="text-sm text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm text-slate-500">No sales recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-800">Sale #{sale.id}</p>
                    <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">${sale.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{sale.items.length} item(s)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Recent Products</h3>
          <Link to="/products" className="text-sm text-emerald-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="pb-2 text-slate-500">Product</th>
                <th className="pb-2 text-slate-500">SKU</th>
                <th className="pb-2 text-slate-500">Category</th>
                <th className="pb-2 text-right text-slate-500">Price</th>
                <th className="pb-2 text-right text-slate-500">Stock</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{product.name}</td>
                  <td className="py-2 text-slate-500">{product.sku}</td>
                  <td className="py-2 text-slate-500">{product.category}</td>
                  <td className="py-2 text-right text-slate-600">${product.price.toFixed(2)}</td>
                  <td className="py-2 text-right">
                    <span className={product.stockQuantity <= (product.minStockLevel || 20) ? "font-bold text-red-600" : "text-slate-600"}>
                      {product.stockQuantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
