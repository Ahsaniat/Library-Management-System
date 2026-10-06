import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Dashboard from './pages/Dashboard';
import MyLoans from './pages/MyLoans';
import MyReservations from './pages/MyReservations';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import MyWishlist from './pages/MyWishlist';
import MyBookRequests from './pages/MyBookRequests';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import MyFines from './pages/MyFines';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { AdminDashboard, UserManagement, BookManagement, LoanManagement, Reports, BookRequestManagement, Settings, FineManagement } from './pages/admin';
import { UserRole } from './types';

function App() {
  return (
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
        <Route
          path="admin/fines"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
              <FineManagement />
            </RoleProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
