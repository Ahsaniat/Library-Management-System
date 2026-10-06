import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { UserRole } from './types';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Books = lazy(() => import('./pages/Books'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyLoans = lazy(() => import('./pages/MyLoans'));
const MyFines = lazy(() => import('./pages/MyFines'));
const MyReservations = lazy(() => import('./pages/MyReservations'));
const MyWishlist = lazy(() => import('./pages/MyWishlist'));
const MyBookRequests = lazy(() => import('./pages/MyBookRequests'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const BookManagement = lazy(() => import('./pages/admin/BookManagement'));
const LoanManagement = lazy(() => import('./pages/admin/LoanManagement'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const BookRequestManagement = lazy(() => import('./pages/admin/BookRequestManagement'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const FineManagement = lazy(() => import('./pages/admin/FineManagement'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" size="lg" />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="verify-email/:token" element={<VerifyEmail />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-loans"
            element={
              <ProtectedRoute>
                <MyLoans />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-fines"
            element={
              <ProtectedRoute>
                <MyFines />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <MyWishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="book-requests"
            element={
              <ProtectedRoute>
                <MyBookRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <UserManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/books"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                <BookManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/loans"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                <LoanManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/fines"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                <FineManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                <Reports />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/book-requests"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                <BookRequestManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <Settings />
              </RoleProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
