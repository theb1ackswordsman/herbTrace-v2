import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Leaf } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-on-surface flex flex-col">
      <nav className="border-b border-white/5 bg-brand-surface/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 text-white font-display font-semibold text-lg">
              <Leaf className="text-brand-green" />
              HerbTrace
            </Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-on-surface/70 hidden sm:block">
                    {user.name} ({user.role})
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-brand-amber hover:text-error transition-colors px-3 py-1.5 rounded hover:bg-error/10"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-brand-dark bg-brand-green px-4 py-1.5 rounded hover:bg-[#00e479] transition-colors">
                  System Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
