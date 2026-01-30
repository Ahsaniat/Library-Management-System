import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/books">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Browse Books
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
