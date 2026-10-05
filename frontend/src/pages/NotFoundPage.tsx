import React from 'react';
import { Link } from 'react-router-dom';
import { BookX, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="page-container text-center py-20">
      <div className="empty-state max-w-md mx-auto glass-panel p-8 rounded-2xl shadow-xl">
        <BookX size={64} className="text-accent mb-4 mx-auto" />
        <h2 className="text-2xl font-bold text-white mb-2">404 - Page Not Found</h2>
        <p className="text-muted text-sm mb-6">
          The requested library resource or route does not exist.
        </p>
        <Link to="/books" className="btn btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Book Catalog
        </Link>
      </div>
    </div>
  );
};
