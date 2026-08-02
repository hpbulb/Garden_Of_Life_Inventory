import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";

export default function SalesHistory() {
  const { sales } = useInventory();
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const filteredSales = sales.filter(
    (sale) =>
      sale.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      sale.id.toString().includes(search)
  );

  const handleView = (sale) => {
    setSelectedSale(sale);
  };

  const handleClose = () => {
    setSelectedSale(null);
  };

  return (
    <div>
      <PageHeader
        title="Sales History"
        subtitle="View and manage past sales transactions"
      />

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name or sale ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sale #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Items</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">
                  No sales found.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-100 table-row-hover">
                  <td className="px-4 py-3 font-medium text-slate-800">#{sale.id}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500">{sale.customerName || "Walk-in Customer"}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{sale.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">${sale.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleView(sale)}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Sale #{selectedSale.id} - Details</h3>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-medium text-slate-800">{new Date(selectedSale.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Customer</p>
                <p className="font-medium text-slate-800">{selectedSale.customerName || "Walk-in Customer"}</p>
              </div>
              <div>
                <p className="text-slate-500">Payment Method</p>
                <p className="font-medium text-slate-800">{selectedSale.paymentMethod}</p>
              </div>
              {selectedSale.paymentReference && (
                <div>
                  <p className="text-slate-500">Paystack Reference</p>
                  <p className="font-medium text-slate-800">{selectedSale.paymentReference}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500">Total</p>
                <p className="font-bold text-emerald-600">${selectedSale.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Unit Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{item.productName}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-600">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClose}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
