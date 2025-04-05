import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-8xl font-bold text-error mb-4">403</div>
      <h1 className="text-2xl md:text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-base-content/70 text-center max-w-md mb-8">
        You don't have permission to access this page. Please log in with an account that has the necessary permissions.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="btn btn-primary">
          Log In
        </Link>
        <Link to="/" className="btn btn-outline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
