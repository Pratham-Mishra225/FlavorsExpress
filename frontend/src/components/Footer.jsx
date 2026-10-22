import React from 'react';
import { Utensils, Heart, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-stone-100 dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 py-12 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-stone-900 dark:text-white">FlavorsExpress</span>
              <span className="text-[10px] block text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider -mt-1">
                Authentic Indian Fast Food
              </span>
            </div>
          </div>
          <p className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed max-w-md">
            Bringing Mumbai street favorites, tandoori pizzas, craft burgers, and dum biryanis hot from our cloud kitchen to your doorstep in 30 minutes.
          </p>
          <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-stone-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Fresh Ingredients</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Express Hot Delivery</span>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-slate-200 uppercase tracking-wider mb-3">Explore</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/menu" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Indian Fast-Food Menu</Link></li>
            <li><Link to="/cart" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Cart & Checkout</Link></li>
            <li><Link to="/orders" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Live Order Tracking</Link></li>
          </ul>
        </div>

        {/* Restaurant Hours */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-slate-200 uppercase tracking-wider mb-3">Kitchen Timings</h4>
          <p className="text-sm text-stone-700 dark:text-slate-300 font-medium">Monday – Sunday</p>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">10:00 AM – 11:30 PM</p>
          <div className="mt-3 text-xs text-stone-500 dark:text-slate-400">
            <span>Special promo: </span>
            <span className="font-bold text-orange-600 dark:text-orange-400">WELCOME20</span>
            <span> for 20% off up to ₹100</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200 dark:border-slate-800/80 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 dark:text-slate-500">
        <p>© 2026 FlavorsExpress. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 md:mt-0">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Food Enthusiasts
        </p>
      </div>
    </footer>
  );
};

export default Footer;
