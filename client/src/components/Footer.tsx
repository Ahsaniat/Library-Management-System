import { Link } from 'react-router-dom';
import { Book, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--parchment-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Book className="h-8 w-8" />
              <span className="text-xl font-bold">LibraryMS</span>
            </div>
            <p className="text-sm opacity-80">
              A comprehensive library management system for managing books, loans,
              reservations, and more. Open source and self-hostable.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/books" className="hover:opacity-100 transition-opacity">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:opacity-100 transition-opacity">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:opacity-100 transition-opacity">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a
                  href="#"
                  className="hover:opacity-100 transition-opacity flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  API Reference
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm opacity-80" style={{ borderColor: 'var(--parchment-border)' }}>
          <p>
            Made by Anik
          </p>
          <p className="mt-2">© {new Date().getFullYear()} LibraryMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
