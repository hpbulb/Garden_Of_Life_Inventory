/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { useFirebase } from "./FirebaseContext";

const InventoryContext = createContext();

export function useInventory() {
  return useContext(InventoryContext);
}

const SEED_CATEGORIES = [
  { id: 1, name: "Supplements", description: "Health supplements and vitamins" },
  { id: 2, name: "Organic Foods", description: "Organic food products" },
  { id: 3, name: "Personal Care", description: "Personal care and hygiene products" },
  { id: 4, name: "Beverages", description: "Healthy drinks and beverages" },
];

const SEED_SUPPLIERS = [
  { id: 1, name: "Garden of Life Inc.", contact: "555-0100", email: "orders@gardenoflife.com", address: "123 Wellness Ave, CA 94000" },
  { id: 2, name: "Nature's Best", contact: "555-0200", email: "sales@naturesbest.com", address: "456 Organic St, NY 10001" },
  { id: 3, name: "Whole Foods Distributors", contact: "555-0300", email: "info@wholefoods.com", address: "789 Natural Rd, TX 75001" },
];

const SEED_PRODUCTS = [
  { id: 1, name: "Vitamin Code Raw One", sku: "VCR-001", category: "Supplements", price: 49.99, cost: 25.0, stockQuantity: 120, minStockLevel: 20, supplier: "Garden of Life Inc.", description: "Raw one multivitamin for men", imageUrl: null, dateAdded: "2025-01-15" },
  { id: 2, name: "MyKind Organics Women's Multi", sku: "MKO-002", category: "Supplements", price: 39.99, cost: 20.0, stockQuantity: 85, minStockLevel: 30, supplier: "Garden of Life Inc.", description: "Organic multivitamin for women", imageUrl: null, dateAdded: "2025-01-20" },
  { id: 3, name: "Raw Organic Protein", sku: "ROP-003", category: "Supplements", price: 44.99, cost: 22.0, stockQuantity: 15, minStockLevel: 25, supplier: "Nature's Best", description: "Plant-based organic protein powder", imageUrl: null, dateAdded: "2025-02-01" },
  { id: 4, name: "Organic Coconut Water", sku: "OCW-004", category: "Beverages", price: 3.99, cost: 1.5, stockQuantity: 200, minStockLevel: 50, supplier: "Whole Foods Distributors", description: "Fresh organic coconut water", imageUrl: null, dateAdded: "2025-01-10" },
  { id: 5, name: "Probiotic Support", sku: "PRO-005", category: "Supplements", price: 34.99, cost: 18.0, stockQuantity: 8, minStockLevel: 20, supplier: "Garden of Life Inc.", description: "Probiotic with 50 billion CFU", imageUrl: null, dateAdded: "2025-01-25" },
  { id: 6, name: "Organic Granola Bars", sku: "OGB-006", category: "Organic Foods", price: 6.99, cost: 3.0, stockQuantity: 150, minStockLevel: 40, supplier: "Whole Foods Distributors", description: "Gluten-free organic granola bars", imageUrl: null, dateAdded: "2025-01-12" },
];

const SEED_CUSTOMERS = [
  { id: 1, name: "Alice Johnson", phone: "555-1001", email: "alice@example.com", address: "101 Maple St, CA 94000" },
  { id: 2, name: "Bob Smith", phone: "555-1002", email: "bob@example.com", address: "202 Oak Ave, NY 10001" },
  { id: 3, name: "Carol Davis", phone: "555-1003", email: "carol@example.com", address: "303 Pine Rd, TX 75001" },
];

const SEED_USERS = [
  { id: 1, name: "Admin User", email: "admin@gfl.com", role: "admin" },
  { id: 2, name: "Sarah Manager", email: "sarah@gfl.com", role: "manager" },
  { id: 3, name: "Mike Staff", email: "mike@gfl.com", role: "staff" },
];

const SEED_SETTINGS = {
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

async function seedCollection(collectionName, data) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) {
    for (const item of data) {
      await setDoc(doc(colRef, String(item.id)), item);
    }
  }
}

async function seedFirestore() {
  try {
    await seedCollection("categories", SEED_CATEGORIES);
    await seedCollection("suppliers", SEED_SUPPLIERS);
    await seedCollection("products", SEED_PRODUCTS);
    await seedCollection("customers", SEED_CUSTOMERS);
    await seedCollection("users", SEED_USERS);
    const settingsRef = doc(db, "settings", "main");
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) {
      await setDoc(settingsRef, SEED_SETTINGS);
    }
  } catch (error) {
    console.error("Error seeding Firestore:", error);
  }
}

export function InventoryProvider({ children }) {
  const { user, role, loading } = useFirebase();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(SEED_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubProducts, unsubCategories, unsubSuppliers, unsubCustomers;
    let unsubSales, unsubPurchases, unsubAdjustments, unsubUsers, unsubNotifications;
    let unsubSettings;

    const setup = async () => {
      if (!user) {
        setReady(true);
        return;
      }

      await seedFirestore();

      const handleSnapshotError = (error) => {
        console.error("Unable to load inventory data:", error);
      };
      unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
        setProducts(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
        setCategories(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snap) => {
        setSuppliers(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
        setCustomers(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("date", "desc")), (snap) => {
        setSales(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubPurchases = onSnapshot(query(collection(db, "purchases"), orderBy("date", "desc")), (snap) => {
        setPurchases(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubAdjustments = onSnapshot(query(collection(db, "adjustments"), orderBy("date", "desc"), limit(50)), (snap) => {
        setStockAdjustments(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setUsers(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubNotifications = onSnapshot(query(collection(db, "notifications"), orderBy("date", "desc")), (snap) => {
        setNotifications(snap.docs.map(d => ({ id: Number(d.id), ...d.data() })));
      }, handleSnapshotError);
      unsubSettings = onSnapshot(doc(db, "settings", "main"), (snap) => {
        if (snap.exists()) {
          setSettings(snap.data());
        }
      }, handleSnapshotError);

      setReady(true);
    };

    if (!loading) {
      setup();
    }

    return () => {
      unsubProducts && unsubProducts();
      unsubCategories && unsubCategories();
      unsubSuppliers && unsubSuppliers();
      unsubCustomers && unsubCustomers();
      unsubSales && unsubSales();
      unsubPurchases && unsubPurchases();
      unsubAdjustments && unsubAdjustments();
      unsubUsers && unsubUsers();
      unsubNotifications && unsubNotifications();
      unsubSettings && unsubSettings();
    };
  }, [loading, role, user]);

  const generateId = useCallback((arr) => {
    const maxId = arr.length > 0 ? Math.max(...arr.map((item) => item.id)) : 0;
    return maxId + 1;
  }, []);

  // ---- Products ----
  const addProduct = useCallback(async (product) => {
    const id = generateId(products);
    const newProduct = { ...product, id, dateAdded: new Date().toISOString().split("T")[0] };
    await setDoc(doc(db, "products", String(id)), newProduct);
    return newProduct;
  }, [products, generateId]);

  const updateProduct = useCallback(async (id, product) => {
    await setDoc(doc(db, "products", String(id)), { ...product, id });
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await deleteDoc(doc(db, "products", String(id)));
  }, []);

  const getProduct = useCallback((id) => products.find((p) => p.id === id), [products]);

  // ---- Categories ----
  const addCategory = useCallback(async (category) => {
    const id = generateId(categories);
    const newCategory = { ...category, id };
    await setDoc(doc(db, "categories", String(id)), newCategory);
    return newCategory;
  }, [categories, generateId]);

  const updateCategory = useCallback(async (id, category) => {
    await setDoc(doc(db, "categories", String(id)), { ...category, id });
  }, []);

  const deleteCategory = useCallback(async (id) => {
    await deleteDoc(doc(db, "categories", String(id)));
  }, []);

  // ---- Suppliers ----
  const addSupplier = useCallback(async (supplier) => {
    const id = generateId(suppliers);
    const newSupplier = { ...supplier, id };
    await setDoc(doc(db, "suppliers", String(id)), newSupplier);
    return newSupplier;
  }, [suppliers, generateId]);

  const updateSupplier = useCallback(async (id, supplier) => {
    await setDoc(doc(db, "suppliers", String(id)), { ...supplier, id });
  }, []);

  const deleteSupplier = useCallback(async (id) => {
    await deleteDoc(doc(db, "suppliers", String(id)));
  }, []);

  const getSupplier = useCallback((id) => suppliers.find((s) => s.id === id), [suppliers]);

  // ---- Customers ----
  const addCustomer = useCallback(async (customer) => {
    const id = generateId(customers);
    const newCustomer = { ...customer, id };
    await setDoc(doc(db, "customers", String(id)), newCustomer);
    return newCustomer;
  }, [customers, generateId]);

  const updateCustomer = useCallback(async (id, customer) => {
    await setDoc(doc(db, "customers", String(id)), { ...customer, id });
  }, []);

  const deleteCustomer = useCallback(async (id) => {
    await deleteDoc(doc(db, "customers", String(id)));
  }, []);

  const getCustomer = useCallback((id) => customers.find((c) => c.id === id), [customers]);

  // ---- Sales ----
  const addSale = useCallback(async (sale) => {
    const id = generateId(sales);
    const newSale = {
      ...sale,
      id,
      date: new Date().toISOString(),
      total: Number.isFinite(sale.total) ? sale.total : sale.items.reduce((sum, item) => sum + item.total, 0),
    };
    await setDoc(doc(db, "sales", String(id)), newSale);

    for (const item of sale.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const newQty = product.stockQuantity - item.quantity;
        await setDoc(doc(db, "products", String(product.id)), { ...product, stockQuantity: newQty });
      }
    }

    return newSale;
  }, [sales, products, generateId]);

  const getSale = useCallback((id) => sales.find((s) => s.id === id), [sales]);

  // ---- Purchases ----
  const addPurchase = useCallback(async (purchase) => {
    const id = generateId(purchases);
    const newPurchase = {
      ...purchase,
      id,
      date: new Date().toISOString(),
      total: Number.isFinite(purchase.total) ? purchase.total : purchase.items.reduce((sum, item) => sum + item.total, 0),
    };
    await setDoc(doc(db, "purchases", String(id)), newPurchase);

    for (const item of purchase.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const newQty = product.stockQuantity + item.quantity;
        await setDoc(doc(db, "products", String(product.id)), { ...product, stockQuantity: newQty });
      }
    }

    return newPurchase;
  }, [purchases, products, generateId]);

  const getPurchase = useCallback((id) => purchases.find((p) => p.id === id), [purchases]);

  // ---- Stock Adjustments ----
  const addStockAdjustment = useCallback(async (adjustment) => {
    const id = generateId(stockAdjustments);
    const newAdjustment = {
      ...adjustment,
      id,
      date: new Date().toISOString(),
    };
    await setDoc(doc(db, "adjustments", String(id)), newAdjustment);

    const product = products.find((p) => p.id === adjustment.productId);
    if (product) {
      let newQty = product.stockQuantity;
      if (adjustment.type === "in") newQty += adjustment.quantity;
      else if (adjustment.type === "out") newQty -= adjustment.quantity;
      else if (adjustment.type === "adjustment") newQty = adjustment.quantity;
      await setDoc(doc(db, "products", String(product.id)), { ...product, stockQuantity: newQty });
    }

    return newAdjustment;
  }, [stockAdjustments, products, generateId]);

  // ---- Users ----
  const addUser = useCallback(async (user) => {
    const id = generateId(users);
    const newUser = { ...user, id };
    await setDoc(doc(db, "users", String(id)), newUser);
    return newUser;
  }, [users, generateId]);

  const updateUser = useCallback(async (id, user) => {
    await setDoc(doc(db, "users", String(id)), { ...user, id });
  }, []);

  const deleteUser = useCallback(async (id) => {
    await deleteDoc(doc(db, "users", String(id)));
  }, []);

  // ---- Notifications ----
  const addNotification = useCallback(async (message, type = "info") => {
    const id = generateId(notifications);
    const newNotification = {
      id,
      message,
      type,
      read: false,
      date: new Date().toISOString(),
    };
    await setDoc(doc(db, "notifications", String(id)), newNotification);
  }, [notifications, generateId]);

  const markNotificationRead = useCallback(async (id) => {
    const ref = doc(db, "notifications", String(id));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { read: true });
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const snap = await getDocs(collection(db, "notifications"));
    const batch = [];
    snap.docs.forEach((d) => {
      if (!d.data().read) {
        batch.push(updateDoc(doc(db, "notifications", d.id), { read: true }));
      }
    });
    await Promise.all(batch);
  }, []);

  const deleteNotification = useCallback(async (id) => {
    await deleteDoc(doc(db, "notifications", String(id)));
  }, []);

  // ---- Settings ----
  const updateSettings = useCallback(async (newSettings) => {
    await setDoc(doc(db, "settings", "main"), newSettings, { merge: true });
  }, []);

  // ---- Computed values ----
  const lowStockProducts = products.filter((p) => p.stockQuantity <= (p.minStockLevel || settings.lowStockThreshold));
  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalRevenue = totalSales;
  const totalCost = products.reduce((sum, p) => sum + (p.cost || 0) * (p.stockQuantity || 0), 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stockQuantity || 0), 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const value = {
    ready,
    products, categories, suppliers, customers, sales, purchases,
    stockAdjustments, users, notifications, settings,
    lowStockProducts, totalProducts, totalSales, totalPurchases,
    totalRevenue, totalCost, totalInventoryValue, unreadNotifications,
    addProduct, updateProduct, deleteProduct, getProduct,
    addCategory, updateCategory, deleteCategory,
    addSupplier, updateSupplier, deleteSupplier, getSupplier,
    addCustomer, updateCustomer, deleteCustomer, getCustomer,
    addSale, getSale,
    addPurchase, getPurchase,
    addStockAdjustment,
    addUser, updateUser, deleteUser,
    addNotification, markNotificationRead, markAllNotificationsRead, deleteNotification,
    updateSettings,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}
