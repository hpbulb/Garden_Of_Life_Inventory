import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./context/InventoryContext";
import { FirebaseProvider } from "./context/FirebaseContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AllProducts from "./pages/AllProducts";
import AddProduct from "./pages/AddProduct";
import Categories from "./pages/Categories";
import StockAdjustment from "./pages/StockAdjustment";
import NewSale from "./pages/NewSale";
import SalesHistory from "./pages/SalesHistory";
import NewPurchase from "./pages/NewPurchase";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import UsersRoles from "./pages/UsersRoles";
import Settings from "./pages/Settings";
import BarcodeGenerator from "./pages/BarcodeGenerator";
import "./App.css";

function App() {
  return (
    <FirebaseProvider>
      <InventoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AllProducts />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit-product/:id" element={<AddProduct />} />
              <Route path="categories" element={<Categories />} />
              <Route path="stock-adjustment" element={<StockAdjustment />} />
              <Route path="new-sale" element={<NewSale />} />
              <Route path="sales-history" element={<SalesHistory />} />
              <Route path="new-purchase" element={<NewPurchase />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="users" element={<UsersRoles />} />
              <Route path="settings" element={<Settings />} />
              <Route path="barcode-generator" element={<BarcodeGenerator />} />
              <Route path="logout" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </FirebaseProvider>
  );
}

export default App;
