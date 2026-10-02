import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Footer, Header } from '@/components/layout/Layout'
import { RequireAdmin, RequireAuth } from '@/components/auth/Guards'
import { Loader } from '@/components/ui/Feedback'
import HomePage from '@/pages/HomePage'

// Route-level code splitting — bundle chhota rehta hai.
const RestaurantPage = lazy(() => import('@/pages/RestaurantPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f7]">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurant/:slug" element={<RestaurantPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <OrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}