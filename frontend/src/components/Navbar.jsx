import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Utensils, User, LogOut, Menu as MenuIcon, X, Shield, Truck, History } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-200">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                FlavorsExpress
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wider uppercase">Gourmet Delivery</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/menu') ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Menu
            </Link>

            {/* Customer Only Links */}
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <Link
                to="/orders"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/orders') ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <History className="w-4 h-4" />
                My Orders
              </Link>
            )}

            {/* Admin Only Link */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin') ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20' : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Admin Dashboard
              </Link>
            )}

            {/* Delivery Partner Only Link */}
            {isAuthenticated && user?.role === 'DELIVERY_PARTNER' && (
              <Link
                to="/delivery"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/delivery') ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-emerald-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                Delivery Portal
              </Link>
            )}
          </div>

          {/* Right Action Icons & User Status */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button (Customer) */}
            {(!isAuthenticated || user?.role === 'CUSTOMER') && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-orange-400 hover:border-orange-500/50 transition-all duration-200"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-200 truncate max-w-[120px]">{user.email}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ml-auto uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    user.role === 'DELIVERY_PARTNER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  }`}>
                    {user.role === 'DELIVERY_PARTNER' ? 'DELIVERY' : user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {(!isAuthenticated || user?.role === 'CUSTOMER') && (
              <Link to="/cart" className="relative p-2 text-slate-300">
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Menu
          </Link>
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              My Orders
            </Link>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-purple-950/40"
            >
              Admin Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'DELIVERY_PARTNER' && (
            <Link
              to="/delivery"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-emerald-300 hover:bg-emerald-950/40"
            >
              Delivery Portal
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300 truncate max-w-[200px]">{user.email}</span>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
