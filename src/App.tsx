import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import TryOn from './pages/TryOn'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Location from './pages/Location'
import Contact from './pages/Contact'
import Account from './pages/Account'
import Admin from './pages/Admin'
import OrderTracking from './pages/OrderTracking'

const App: React.FC = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:id" element={<ProductDetail />} />
      <Route path="/try-on" element={<TryOn />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/location" element={<Location />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/account" element={<Account />} />
      <Route path="/orders/:id" element={<OrderTracking />} />
      <Route path="/admin" element={<Admin />} />
    </Route>
  </Routes>
)

export default App
