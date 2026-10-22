import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingBag, Utensils, LogOut, Menu as MenuIcon, X,
  Shield, Truck, History, Sun, Moon
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-stone-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200 text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
                FlavorsExpress
              </span>
              <span className="text-[10px] text-stone-500 dark:text-slate-400 -mt-1 font-semibold tracking-wider uppercase">
                Indian Fast Food
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/')
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20'
                  : 'text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/menu')
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20'
                  : 'text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Menu
            </Link>

            {/* Customer Only Links */}
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <Link
                to="/orders"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/orders')
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20'
                    : 'text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/60'
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
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Admin Dashboard
              </Link>
            )}

            {/* Delivery Partner Only Link */}
            {isAuthenticated && user?.role === 'DELIVERY_PARTNER' && (
              <Link
                to="/delivery"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/delivery')
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                    : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Delivery Portal
              </Link>
            )}
          </div>

          {/* Right Action Icons: Theme Toggle, Cart, User Status */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-100 dark:bg-slate-800/80 text-stone-700 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle color theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Cart Button (Customer) */}
            {(!isAuthenticated || user?.role === 'CUSTOMER') && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/60 text-stone-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 shadow-sm"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-orange-500/40 animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 border-l border-stone-200 dark:border-slate-800 pl-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-800 dark:text-slate-200 truncate max-w-[130px]">
                    {user.email}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ml-auto uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30' :
                    user.role === 'DELIVERY_PARTNER' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30'
                  }`}>
                    {user.role === 'DELIVERY_PARTNER' ? 'DELIVERY' : user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-stone-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-stone-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Header Icons: Theme toggle + Cart + Menu */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-amber-400"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {(!isAuthenticated || user?.role === 'CUSTOMER') && (
              <Link to="/cart" className="relative p-2 text-stone-700 dark:text-slate-300">
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
              className="p-2 rounded-lg bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-stone-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-stone-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            Menu
          </Link>
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-stone-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              My Orders
            </Link>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              Admin Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'DELIVERY_PARTNER' && (
            <Link
              to="/delivery"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              Delivery Portal
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600 dark:text-slate-400 truncate max-w-[200px]">
                {user.email}
              </span>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 text-xs font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-stone-200 dark:border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 text-sm font-semibold"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md"
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
