import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { AuthGateProvider } from '@/context/AuthGateContext'
import { CartProvider } from '@/context/CartContext'
import { RouteLoading } from '@/components/layout/RouteLoading'
import { LandingPage } from '@/pages/LandingPage'

// Halaman selain Beranda dimuat sesuai kebutuhan (code-splitting) — mengurangi ukuran
// bundle awal yang harus diunduh semua orang, termasuk yang cuma mampir sebentar.
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const ProductDetailPage = lazy(() =>
  import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
const CartPage = lazy(() => import('@/pages/CartPage').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const WishlistPage = lazy(() => import('@/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })))
const AccountPage = lazy(() => import('@/pages/AccountPage').then((m) => ({ default: m.AccountPage })))
const TermsPage = lazy(() => import('@/pages/static/TermsPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('@/pages/static/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const AboutPage = lazy(() => import('@/pages/static/AboutPage').then((m) => ({ default: m.AboutPage })))
const StorePage = lazy(() => import('@/pages/StorePage').then((m) => ({ default: m.StorePage })))
const SellerOverviewPage = lazy(() =>
  import('@/pages/seller/SellerOverviewPage').then((m) => ({ default: m.SellerOverviewPage })),
)
const SellerProductsPage = lazy(() =>
  import('@/pages/seller/SellerProductsPage').then((m) => ({ default: m.SellerProductsPage })),
)
const SellerOrdersPage = lazy(() =>
  import('@/pages/seller/SellerOrdersPage').then((m) => ({ default: m.SellerOrdersPage })),
)
const SellerSettingsPage = lazy(() =>
  import('@/pages/seller/SellerSettingsPage').then((m) => ({ default: m.SellerSettingsPage })),
)
const SellerWarehousePage = lazy(() => import('@/pages/seller/SellerWarehousePage').then((m) => ({ default: m.SellerWarehousePage })))

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AuthGateProvider>
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/lupa-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/produk" element={<CatalogPage />} />
                  <Route path="/produk/:id" element={<ProductDetailPage />} />
                  <Route path="/keranjang" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/pesanan" element={<OrdersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/akun" element={<AccountPage />} />
                  <Route path="/ketentuan-layanan" element={<TermsPage />} />
                  <Route path="/kebijakan-privasi" element={<PrivacyPage />} />
                  <Route path="/tentang" element={<AboutPage />} />
                  <Route path="/toko" element={<SellerOverviewPage />} />
                  <Route path="/toko/produk" element={<SellerProductsPage />} />
                  <Route path="/toko/pesanan" element={<SellerOrdersPage />} />
                  <Route path="/toko/gudang" element={<SellerWarehousePage />} />
                  <Route path="/toko/pengaturan" element={<SellerSettingsPage />} />
                  <Route path="/toko/:slug" element={<StorePage />} />
                </Routes>
              </Suspense>
            </AuthGateProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
