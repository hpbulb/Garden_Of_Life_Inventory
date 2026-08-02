import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { useFirebase } from "../context/FirebaseContext";
import PageHeader from "../components/PageHeader";

const AUTO_CART_SCAN_COUNT = 5;

export default function NewSale() {
  const { products, customers, settings, addSale } = useInventory();
  const { user } = useFirebase();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paystackEmail, setPaystackEmail] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("");
  const [pendingScans, setPendingScans] = useState([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const scannerRef = useRef(null);
  const scanLockRef = useRef({ value: "", time: 0 });

  const filteredProducts = products.filter(
    (p) =>
      p.stockQuantity > 0 &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) return currentCart;
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
            : item
        );
      }

      if (quantity > product.stockQuantity) return currentCart;
      return [
        ...currentCart,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
        },
      ];
    });
  }, []);

  const addScansToCart = useCallback((scans) => {
    const quantitiesByProduct = scans.reduce((totals, item) => {
      totals[item.productId] = (totals[item.productId] || 0) + 1;
      return totals;
    }, {});

    setCart((currentCart) => {
      let nextCart = currentCart;

      Object.entries(quantitiesByProduct).forEach(([productId, quantity]) => {
        const scannedProduct = products.find((item) => item.id === Number(productId));
        if (!scannedProduct) return;

        const existing = nextCart.find((item) => item.productId === scannedProduct.id);
        if (existing) {
          const newQty = existing.quantity + quantity;
          if (newQty > scannedProduct.stockQuantity) return;
          nextCart = nextCart.map((item) =>
            item.productId === scannedProduct.id
              ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
              : item
          );
          return;
        }

        if (quantity > scannedProduct.stockQuantity) return;
        nextCart = [
          ...nextCart,
          {
            productId: scannedProduct.id,
            productName: scannedProduct.name,
            quantity,
            unitPrice: scannedProduct.price,
            total: scannedProduct.price * quantity,
          },
        ];
      });

      return nextCart;
    });
  }, [products]);

  const findProductByBarcode = useCallback((barcode) => {
    const cleanBarcode = barcode.trim().toLowerCase();
    return products.find((product) => product.sku?.toLowerCase() === cleanBarcode);
  }, [products]);

  const queueScannedProduct = useCallback((barcode) => {
    const product = findProductByBarcode(barcode);
    if (!product) {
      setScannerStatus(`Barcode ${barcode} was not found.`);
      return;
    }

    if (product.stockQuantity <= 0) {
      setScannerStatus(`${product.name} is out of stock.`);
      return;
    }

    setPendingScans((currentScans) => {
      const productScanCount = currentScans.filter((item) => item.productId === product.id).length;
      const cartItem = cart.find((item) => item.productId === product.id);
      const cartQuantity = cartItem?.quantity || 0;

      if (productScanCount + cartQuantity >= product.stockQuantity) {
        setScannerStatus(`${product.name} has no more available stock for this sale.`);
        return currentScans;
      }

      const nextScans = [
        ...currentScans,
        {
          productId: product.id,
          productName: product.name,
          barcode: product.sku,
          unitPrice: product.price,
        },
      ];

      if (nextScans.length >= AUTO_CART_SCAN_COUNT) {
        addScansToCart(nextScans);
        setScannerStatus(`${nextScans.length} in-stock barcode scans added to the sale.`);
        return [];
      }

      setScannerStatus(`${nextScans.length} valid scan(s). Scan ${AUTO_CART_SCAN_COUNT - nextScans.length} more to add to sale.`);
      return nextScans;
    });
  }, [addScansToCart, cart, findProductByBarcode]);

  const handleBarcodeDetected = useCallback((barcode) => {
    const now = Date.now();
    const lastScan = scanLockRef.current;
    if (lastScan.value === barcode && now - lastScan.time < 1500) return;

    scanLockRef.current = { value: barcode, time: now };
    queueScannedProduct(barcode);
  }, [queueScannedProduct]);

  useEffect(() => {
    if (!scannerActive) return undefined;

    let scanner;

    const startScanner = async () => {
      if (!window.Html5Qrcode) {
        setScannerStatus("Barcode scanner is still loading. Please try again in a moment.");
        setScannerActive(false);
        return;
      }

      try {
        scanner = new window.Html5Qrcode("barcode-scanner");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 180 } },
          (decodedText) => handleBarcodeDetected(decodedText),
          () => {}
        );

        setScannerStatus(`Camera ready. Scan ${AUTO_CART_SCAN_COUNT} in-stock barcodes to add them to the sale.`);
      } catch {
        setScannerStatus("Unable to start the camera. Allow camera access and try again.");
        setScannerActive(false);
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [handleBarcodeDetected, scannerActive]);

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    queueScannedProduct(manualBarcode);
    setManualBarcode("");
  };

  const updateQuantity = (productId, newQty) => {
    const product = products.find((p) => p.id === productId);
    if (!product || newQty < 1 || newQty > product.stockQuantity) return;
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
  const currency = settings?.currency || "NGN";

  const loadPaystackScript = () =>
    new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
        return;
      }

      const existingScript = document.querySelector("script[src='https://js.paystack.co/v1/inline.js']");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.PaystackPop), { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve(window.PaystackPop);
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const authorizePaystackPayment = async (customerName) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert("Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.");
      return null;
    }

    const PaystackPop = await loadPaystackScript();
    const paymentEmail = paystackEmail.trim() || user?.email || settings?.companyEmail;
    if (!paymentEmail) {
      alert("Please enter a customer email for Paystack authorization.");
      return null;
    }

    return new Promise((resolve) => {
      const handler = PaystackPop.setup({
        key: publicKey,
        email: paymentEmail,
        amount: Math.round(total * 100),
        currency,
        ref: `sale-${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer",
              variable_name: "customer",
              value: customerName,
            },
          ],
        },
        callback: (response) => resolve(response),
        onClose: () => resolve(null),
      });

      handler.openIframe();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add at least one product to the cart.");
      return;
    }

    const customer = customers.find((c) => c.id === Number(selectedCustomer));
    const customerName = customer ? customer.name : "Walk-in Customer";
    let paystackAuthorization = null;

    if (paymentMethod === "paystack") {
      setIsPaying(true);
      const paymentAuthorization = await authorizePaystackPayment(customerName);
      setIsPaying(false);

      if (!paymentAuthorization) {
        alert("Paystack payment was not completed.");
        return;
      }

      paystackAuthorization = {
        reference: paymentAuthorization.reference,
        transaction: paymentAuthorization.trans,
        status: paymentAuthorization.status,
        message: paymentAuthorization.message,
        transactionId: paymentAuthorization.transaction,
        trxref: paymentAuthorization.trxref,
      };
    }

    await addSale({
      items: cart,
      customerId: selectedCustomer ? Number(selectedCustomer) : null,
      customerName,
      paymentMethod,
      paymentReference: paystackAuthorization?.reference || null,
      paystackAuthorization,
      total: total,
    });

    navigate("/sales-history");
  };

  return (
    <div>
      <PageHeader
        title="New Sale"
        subtitle="Create a new sale transaction"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Product Search */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>
              <button
                type="button"
                onClick={() => setScannerActive((active) => !active)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
              >
                {scannerActive ? "Stop Camera" : "Scan Barcode"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="aspect-video overflow-hidden rounded-lg bg-slate-950">
                  {scannerActive ? (
                    <div id="barcode-scanner" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                      Camera scanner is off.
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {scannerStatus || `Scan ${AUTO_CART_SCAN_COUNT} in-stock barcodes and they will move into the sale cart.`}
                </p>
              </div>

              <div>
                <form onSubmit={handleManualBarcodeSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter barcode/SKU manually..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Add Scan
                  </button>
                </form>

                <div className="mt-3 rounded-lg border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
                    Pending scans ({pendingScans.length}/{AUTO_CART_SCAN_COUNT})
                  </div>
                  <div className="max-h-40 overflow-y-auto p-3">
                    {pendingScans.length === 0 ? (
                      <p className="text-sm text-slate-500">No pending barcode scans.</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingScans.map((item, index) => (
                          <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                            <span className="font-medium text-slate-800">{item.productName}</span>
                            <span className="text-slate-500">{item.barcode}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Stock</th>
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
                      <td className="px-4 py-2 text-right text-slate-600">${product.price.toFixed(2)}</td>
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
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Cart ({cart.length} items)</h3>
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
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Checkout</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700">Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700">Payment Method</label>
              <div className="mt-1 flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Cash</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Card</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Transfer</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={paymentMethod === "paystack"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Paystack</span>
                </label>
              </div>
            </div>

            {paymentMethod === "paystack" && (
              <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <label className="block text-sm font-medium text-slate-700">Paystack Authorization Email *</label>
                <input
                  type="email"
                  value={paystackEmail}
                  onChange={(e) => setPaystackEmail(e.target.value)}
                  placeholder={user?.email || settings?.companyEmail || "customer@email.com"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  The sale will be saved only after Paystack returns a successful authorization reference.
                </p>
              </div>
            )}

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
              disabled={cart.length === 0 || isPaying}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPaying ? "Authorizing Paystack..." : paymentMethod === "paystack" ? "Pay with Paystack" : "Complete Sale"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
