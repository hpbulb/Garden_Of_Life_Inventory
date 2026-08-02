/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback, useState } from "react";

const InventoryContext = createContext();

export function useInventory() {
  return useContext(InventoryContext);
}

// Helper: load from localStorage
function load(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

// Helper: save to localStorage
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Seed data
const seedCategories = [
  { id: 1, name: "Supplements", description: "Health supplements and vitamins" },
  { id: 2, name: "Organic Foods", description: "Organic food products" },
  { id: 3, name: "Personal Care", description: "Personal care and hygiene products" },
  { id: 4, name: "Beverages", description: "Healthy drinks and beverages" },
];

const seedSuppliers = [
  { id: 1, name: "Garden of Life Inc.", contact: "555-0100", email: "orders@gardenoflife.com", address: "123 Wellness Ave, CA 94000" },
  { id: 2, name: "Nature's Best", contact: "555-0200", email: "sales@naturesbest.com", address: "456 Organic St, NY 10001" },
  { id: 3, name: "Whole Foods Distributors", contact: "555-0300", email: "info@wholefoods.com", address: "789 Natural Rd, TX 75001" },
];

const seedProducts = [
  { id: 1, name: "Vitamin Code Raw One", sku: "VCR-001", category: "Supplements", price: 49.99, cost: 25.0, stockQuantity: 120, minStockLevel: 20, supplier: "Garden of Life Inc.", description: "Raw one multivitamin for men", imageUrl: null, dateAdded: "2025-01-15" },
  { id: 2, name: "MyKind Organics Women's Multi", sku: "MKO-002", category: "Supplements", price: 39.99, cost: 20.0, stockQuantity: 85, minStockLevel: 30, supplier: "Garden of Life Inc.", description: "Organic multivitamin for women", imageUrl: null, dateAdded: "2025-01-20" },
  { id: 3, name: "Raw Organic Protein", sku: "ROP-003", category: "Supplements", price: 44.99, cost: 22.0, stockQuantity: 15, minStockLevel: 25, supplier: "Nature's Best", description: "Plant-based organic protein powder", imageUrl: null, dateAdded: "2025-02-01" },
  { id: 4, name: "Organic Coconut Water", sku: "OCW-004", category: "Beverages", price: 3.99, cost: 1.5, stockQuantity: 200, minStockLevel: 50, supplier: "Whole Foods Distributors", description: "Fresh organic coconut water", imageUrl: null, dateAdded: "2025-01-10" },
  { id: 5, name: "Probiotic Support", sku: "PRO-005", category: "Supplements", price: 34.99, cost: 18.0, stockQuantity: 8, minStockLevel: 20, supplier: "Garden of Life Inc.", description: "Probiotic with 50 billion CFU", imageUrl: null, dateAdded: "2025-01-25" },
  { id: 6, name: "Organic Granola Bars", sku: "OGB-006", category: "Organic Foods", price: 6.99, cost: 3.0, stockQuantity: 150, minStockLevel: 40, supplier: "Whole Foods Distributors", description: "Gluten-free organic granola bars", imageUrl: null, dateAdded: "2025-01-12" },
];

const seedCustomers = [
  { id: 1, name: "Alice Johnson", phone: "555-1001", email: "alice@example.com", address: "101 Maple St, CA 94000" },
  { id: 2, name: "Bob Smith", phone: "555-1002", email: "bob@example.com", address: "202 Oak Ave, NY 10001" },
  { id: 3, name: "Carol Davis", phone: "555-1003", email: "carol@example.com", address: "303 Pine Rd, TX 75001" },
];

const seedUsers = [
  { id: 1, name: "Admin User", email: "admin@gfl.com", role: "admin", password: "admin123" },
  { id: 2, name: "Sarah Manager", email: "sarah@gfl.com", role: "manager", password: "manager123" },
  { id: 3, name: "Mike Staff", email: "mike@gfl.com", role: "staff", password: "staff123" },
];

const seedSettings = {
  companyName: "Garden of Life",
  companyAddress: "123 Wellness Ave, CA 94000",
  companyPhone: "555-0000",
  companyEmail: "info@gardenoflife.com",
  currency: "USD",
  taxRate: 0.08,
  lowStockThreshold: 20,
  enableNotifications: true,
  enableEmailAlerts: true,
};

export function InventoryProvider({ children }) {
  // Products
  const [products, setProducts] = useState(() => load("gfl_products", seedProducts));
  // Categories
  const [categories, setCategories] = useState(() => load("gfl_categories", seedCategories));
  // Suppliers
  const [suppliers, setSuppliers] = useState(() => load("gfl_suppliers", seedSuppliers));
  // Customers
  const [customers, setCustomers] = useState(() => load("gfl_customers", seedCustomers));
  // Sales
  const [sales, setSales] = useState(() => load("gfl_sales", []));
  // Purchases
  const [purchases, setPurchases] = useState(() => load("gfl_purchases", []));
  // Stock Adjustments
  const [stockAdjustments, setStockAdjustments] = useState(() => load("gfl_adjustments", []));
  // Users
  const [users, setUsers] = useState(() => load("gfl_users", seedUsers));
  // Notifications
  const [notifications, setNotifications] = useState(() => load("gfl_notifications", []));
  // Settings
  const [settings, setSettings] = useState(() => load("gfl_settings", seedSettings));

  // Persist to localStorage
  useEffect(() => save("gfl_products", products), [products]);
  useEffect(() => save("gfl_categories", categories), [categories]);
  useEffect(() => save("gfl_suppliers", suppliers), [suppliers]);
  useEffect(() => save("gfl_customers", customers), [customers]);
  useEffect(() => save("gfl_sales", sales), [sales]);
  useEffect(() => save("gfl_purchases", purchases), [purchases]);
  useEffect(() => save("gfl_adjustments", stockAdjustments), [stockAdjustments]);
  useEffect(() => save("gfl_users", users), [users]);
  useEffect(() => save("gfl_notifications", notifications), [notifications]);
  useEffect(() => save("gfl_settings", settings), [settings]);

  // Generate unique ID
  const generateId = (arr) => {
    const maxId = arr.length > 0 ? Math.max(...arr.map((item) => item.id)) : 0;
    return maxId + 1;
  };

  // ---- Products ----
  const addProduct = (product) => {
    const newProduct = { ...product, id: generateId(products), dateAdded: new Date().toISOString().split("T")[0] };
    setProducts([newProduct, ...products]);
    addNotification(`Product "${product.name}" added to inventory`, "info");
    return newProduct;
  };

  const updateProduct = (id, product) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...product, id } : p)));
  };

  const deleteProduct = (id) => {
    const product = products.find((p) => p.id === id);
    setProducts(products.filter((p) => p.id !== id));
    addNotification(`Product "${product?.name}" removed from inventory`, "info");
  };

  const getProduct = (id) => products.find((p) => p.id === id);

  // ---- Categories ----
  const addCategory = (category) => {
    const newCategory = { ...category, id: generateId(categories) };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, category) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...category, id } : c)));
  };

  const deleteCategory = (id) => {
    const category = categories.find((c) => c.id === id);
    setCategories(categories.filter((c) => c.id !== id));
    // Update products that used this category
    setProducts(products.map((p) => (p.category === category?.name ? { ...p, category: "" } : p)));
  };

  // ---- Suppliers ----
  const addSupplier = (supplier) => {
    const newSupplier = { ...supplier, id: generateId(suppliers) };
    setSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id, supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...supplier, id } : s)));
  };

  const deleteSupplier = (id) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  const getSupplier = (id) => suppliers.find((s) => s.id === id);

  // ---- Customers ----
  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: generateId(customers) };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...customer, id } : c)));
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const getCustomer = (id) => customers.find((c) => c.id === id);

  // ---- Sales ----
  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: generateId(sales),
      date: new Date().toISOString(),
      total: sale.items.reduce((sum, item) => sum + item.total, 0),
    };
    setSales([newSale, ...sales]);

    // Reduce stock for each sold item
    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateProduct(product.id, { ...product, stockQuantity: product.stockQuantity - item.quantity });
      }
    });

    addNotification(`Sale #${newSale.id} recorded - $${newSale.total.toFixed(2)}`, "sale");
    return newSale;
  };

  const getSale = (id) => sales.find((s) => s.id === id);

  // ---- Purchases ----
  const addPurchase = (purchase) => {
    const newPurchase = {
      ...purchase,
      id: generateId(purchases),
      date: new Date().toISOString(),
      total: purchase.items.reduce((sum, item) => sum + item.total, 0),
    };
    setPurchases([newPurchase, ...purchases]);

    // Increase stock for each purchased item
    purchase.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateProduct(product.id, { ...product, stockQuantity: product.stockQuantity + item.quantity });
      }
    });

    addNotification(`Purchase #${newPurchase.id} recorded - $${newPurchase.total.toFixed(2)}`, "purchase");
    return newPurchase;
  };

  const getPurchase = (id) => purchases.find((p) => p.id === id);

  // ---- Stock Adjustments ----
  const addStockAdjustment = (adjustment) => {
    const newAdjustment = {
      ...adjustment,
      id: generateId(stockAdjustments),
      date: new Date().toISOString(),
    };
    setStockAdjustments([newAdjustment, ...stockAdjustments]);

    // Update product stock
    const product = products.find((p) => p.id === adjustment.productId);
    if (product) {
      let newQty = product.stockQuantity;
      if (adjustment.type === "in") newQty += adjustment.quantity;
      else if (adjustment.type === "out") newQty -= adjustment.quantity;
      else if (adjustment.type === "adjustment") newQty = adjustment.quantity;
      updateProduct(product.id, { ...product, stockQuantity: newQty });
    }

    addNotification(`Stock adjusted for "${product?.name}"`, "info");
    return newAdjustment;
  };

  // ---- Users ----
  const addUser = (user) => {
    const newUser = { ...user, id: generateId(users) };
    setUsers([...users, newUser]);
    return newUser;
  };

  const updateUser = (id, user) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...user, id } : u)));
  };

  const deleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  // ---- Notifications ----
  const addNotification = useCallback((message, type = "info") => {
    const newNotification = {
      id: generateId(notifications),
      message,
      type,
      read: false,
      date: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, [notifications]);

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ---- Settings ----
  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  // ---- Computed values ----
  const lowStockProducts = products.filter((p) => p.stockQuantity <= (p.minStockLevel || settings.lowStockThreshold));
  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalRevenue = totalSales;
  const totalCost = products.reduce((sum, p) => sum + p.cost * p.stockQuantity, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Check for low stock on load and generate notifications
  useEffect(() => {
    const notified = JSON.parse(localStorage.getItem("gfl_low_stock_notified") || "[]");
    lowStockProducts.forEach((product) => {
      if (!notified.includes(product.id)) {
        addNotification(`Low stock alert: "${product.name}" has only ${product.stockQuantity} units left`, "warning");
        notified.push(product.id);
      }
    });
    localStorage.setItem("gfl_low_stock_notified", JSON.stringify(notified));
  }, [products, addNotification, lowStockProducts]);

  const value = {
    // Data
    products, categories, suppliers, customers, sales, purchases,
    stockAdjustments, users, notifications, settings,
    // Computed
    lowStockProducts, totalProducts, totalSales, totalPurchases,
    totalRevenue, totalCost, totalInventoryValue, unreadNotifications,
    // Products
    addProduct, updateProduct, deleteProduct, getProduct,
    // Categories
    addCategory, updateCategory, deleteCategory,
    // Suppliers
    addSupplier, updateSupplier, deleteSupplier, getSupplier,
    // Customers
    addCustomer, updateCustomer, deleteCustomer, getCustomer,
    // Sales
    addSale, getSale,
    // Purchases
    addPurchase, getPurchase,
    // Stock Adjustments
    addStockAdjustment,
    // Users
    addUser, updateUser, deleteUser,
    // Notifications
    addNotification, markNotificationRead, markAllNotificationsRead, deleteNotification,
    // Settings
    updateSettings,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}
