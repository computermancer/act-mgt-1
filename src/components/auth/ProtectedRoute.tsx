import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoginModal from './LoginModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitialCheckDone(true);
      setShowLogin(!isAuthenticated);
    }
  }, [isLoading, isAuthenticated]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // Force a re-render to check auth status again
    window.location.reload();
  };

  if (isLoading || !initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
