import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-8xl font-bold text-primary mb-4">404</div>
      <h1 className="text-2xl md:text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-base-content/70 text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved to another location.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
