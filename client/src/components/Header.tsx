import { Link, useNavigate } from 'react-router-dom';
import { Book, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store';
import { useLogout } from '../hooks';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Book className="h-8 w-8" />
              <span className="text-xl font-bold">LibraryMS</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/books" className="hover:text-blue-200 transition-colors">
              Catalog
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
                  Dashboard
                </Link>
                <Link to="/my-loans" className="hover:text-blue-200 transition-colors">
                  My Loans
                </Link>
                <Link to="/my-reservations" className="hover:text-blue-200 transition-colors">
                  Reservations
                </Link>
                <div className="flex items-center gap-4 ml-4 border-l border-blue-400 pl-4">
                  <span className="text-sm">{user?.firstName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 hover:text-blue-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="hover:text-blue-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
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
              <Link to="/books" className="hover:text-blue-200">
                Catalog
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/my-loans">My Loans</Link>
                  <Link to="/my-reservations">Reservations</Link>
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
