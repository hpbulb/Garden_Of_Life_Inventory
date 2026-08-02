import { useState } from "react";
import { useInventory } from "../context/InventoryContext";

const formatCurrency = (value, currency) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: currency || "USD",
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

function createReply(message, inventory) {
  const query = message.trim().toLowerCase();
  const { products, lowStockProducts, totalRevenue, totalPurchases, totalInventoryValue, settings } = inventory;
  const currency = settings?.currency || "USD";

  if (!query) return "Ask about products, stock, sales, purchases, or inventory value.";
  if (/^(hi|hello|hey)\b/.test(query)) return "Hello! Ask me about stock levels, products, sales, purchases, or inventory value.";
  if (query.includes("low stock") || query.includes("running low")) {
    if (!lowStockProducts.length) return "Great news—there are no low-stock products right now.";
    return `There are ${lowStockProducts.length} low-stock item(s): ${lowStockProducts.slice(0, 5).map((product) => `${product.name} (${product.stockQuantity} left)`).join(", ")}.`;
  }
  if (query.includes("inventory value") || query.includes("stock value")) return `Current inventory value is ${formatCurrency(totalInventoryValue, currency)}.`;
  if (query.includes("revenue") || query.includes("sales total") || query.includes("total sales")) return `Total sales revenue is ${formatCurrency(totalRevenue, currency)}.`;
  if (query.includes("purchase") || query.includes("spent")) return `Total purchases are ${formatCurrency(totalPurchases, currency)}.`;
  if (query.includes("how many product") || query.includes("product count")) return `You currently have ${products.length} product(s) in inventory.`;

  const matchingProduct = products.find((product) => {
    const searchable = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
    return query.split(/\s+/).filter((word) => word.length > 2).some((word) => searchable.includes(word));
  });

  if (matchingProduct) {
    return `${matchingProduct.name} (${matchingProduct.sku}) has ${matchingProduct.stockQuantity} in stock and sells for ${formatCurrency(matchingProduct.price, currency)}.`;
  }

  return "I can help with product availability, low stock, inventory value, sales, and purchases. Try “Which items are low in stock?”";
}

export default function InventoryChatbot() {
  const inventory = useInventory();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi! I’m your inventory assistant. What would you like to know?" }]);
  const sendMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", text },
      { role: "assistant", text: createReply(text, inventory) },
    ]);
    setMessage("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[28rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Inventory Assistant</p>
              <p className="text-xs text-emerald-100">Live inventory answers</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((chatMessage, index) => (
              <p
                key={`${chatMessage.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${chatMessage.role === "user" ? "ml-auto bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {chatMessage.text}
              </p>
            ))}
          </div>
          <form className="flex gap-2 border-t border-slate-200 p-3" onSubmit={sendMessage}>
            <input
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about inventory..."
            />
            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700" type="submit">Send</button>
          </form>
        </section>
      )}
      <button
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-lg hover:bg-emerald-700"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close inventory assistant" : "Open inventory assistant"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
