import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-200' : '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Activities Manager</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                to="/activities"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive(
                  '/activities'
                )}`}
              >
                <span className="truncate">Activities</span>
              </Link>
              <Link
                to="/calendar"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive(
                  '/calendar'
                )}`}
              >
                <span className="truncate">Calendar</span>
              </Link>
              <Link
                to="/notes"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive(
                  '/notes'
                )}`}
              >
                <span className="truncate">Notes</span>
              </Link>
            </nav>
          </aside>

          {/* Page Content */}
          <div className="flex-1">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <p> {new Date().getFullYear()} Activities Management App</p>
      </footer>
    </div>
  );
};

export default Layout;
