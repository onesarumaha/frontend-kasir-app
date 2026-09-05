import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import Pos from './pages/Pos';
import Products from './pages/Products';
import Category from './pages/Category';
import Tenants from './pages/Tenants';
import TenantSetting from './pages/TenantSetting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<Pos />} />
          <Route path="/products" element={<Products />} />
          <Route path="/category" element={<Category />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/setting-toko" element={<TenantSetting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;