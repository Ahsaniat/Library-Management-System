import { Link, useNavigate } from 'react-router-dom';
import { Book, Menu, X, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store';
import { useLogout } from '../hooks';
import NotificationDropdown from './NotificationDropdown';
import { UserRole } from '../types';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const isAdminOrLibrarian = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  const isMember = user?.role === UserRole.MEMBER;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ backgroundColor: 'var(--accent-warm)' }} className="text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Book className="h-8 w-8" />
              <span className="text-xl font-bold">LibraryMS</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/books" className="hover:opacity-80 transition-opacity">
              Catalog
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={isAdminOrLibrarian ? '/admin' : '/dashboard'} className="hover:opacity-80 transition-opacity">
                  Dashboard
                </Link>
                {isMember && (
                  <>
                    <Link to="/my-loans" className="hover:opacity-80 transition-opacity">
                      My Loans
                    </Link>
                    <Link to="/my-reservations" className="hover:opacity-80 transition-opacity">
                      Reservations
                    </Link>
                  </>
                )}
                {isAdminOrLibrarian && (
                  <div className="relative group">
                    <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <Settings className="h-4 w-4" />
                      Admin
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50" style={{ backgroundColor: 'var(--parchment-light)' }}>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-100"
                        style={{ color: 'var(--ink-primary)' }}
                      >
                        Dashboard
                      </Link>
                      {user?.role === UserRole.ADMIN && (
                        <Link
                          to="/admin/users"
                          className="block px-4 py-2 hover:bg-gray-100"
                          style={{ color: 'var(--ink-primary)' }}
                        >
                          User Management
                        </Link>
                      )}
                      <Link
                        to="/admin/books"
                        className="block px-4 py-2 hover:bg-gray-100"
                        style={{ color: 'var(--ink-primary)' }}
                      >
                        Book Management
                      </Link>
                      <Link
                        to="/admin/loans"
                        className="block px-4 py-2 hover:bg-gray-100"
                        style={{ color: 'var(--ink-primary)' }}
                      >
                        Loan Management
                      </Link>
                      <Link
                        to="/admin/reports"
                        className="block px-4 py-2 hover:bg-gray-100"
                        style={{ color: 'var(--ink-primary)' }}
                      >
                        Reports
                      </Link>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 ml-4 border-l border-white/30 pl-4">
                  <NotificationDropdown />
                  <span className="text-sm">{user?.firstName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 hover:opacity-80"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="hover:opacity-80 transition-opacity"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: 'var(--parchment-light)', color: 'var(--ink-primary)' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-4">
              <Link to="/books" className="hover:opacity-80">
                Catalog
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={isAdminOrLibrarian ? '/admin' : '/dashboard'}>Dashboard</Link>
                  {isMember && (
                    <>
                      <Link to="/my-loans">My Loans</Link>
                      <Link to="/my-reservations">Reservations</Link>
                    </>
                  )}
                  {isAdminOrLibrarian && (
                    <>
                      <div className="border-t border-white/30 pt-2 mt-2">
                        <span className="text-white/70 text-sm">Admin</span>
                      </div>
                      <Link to="/admin">Admin Dashboard</Link>
                      {user?.role === UserRole.ADMIN && (
                        <Link to="/admin/users">User Management</Link>
                      )}
                      <Link to="/admin/books">Book Management</Link>
                      <Link to="/admin/loans">Loan Management</Link>
                      <Link to="/admin/reports">Reports</Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
