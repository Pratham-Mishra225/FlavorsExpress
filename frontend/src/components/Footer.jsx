import React from 'react';
import { Utensils, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white">FlavorsExpress</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Delivering fresh, hot gourmet meals from our kitchen straight to your doorstep. Experience restaurant quality in every bite.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/menu" className="hover:text-orange-400 transition-colors">Our Menu</a></li>
            <li><a href="/cart" className="hover:text-orange-400 transition-colors">Cart & Checkout</a></li>
            <li><a href="/orders" className="hover:text-orange-400 transition-colors">Track Orders</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Restaurant Hours</h4>
          <p className="text-sm text-slate-400">Monday – Sunday: 10:00 AM – 11:00 PM</p>
          <p className="text-sm text-slate-400 mt-2">Support: support@flavorsexpress.com</p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 FlavorsExpress. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 md:mt-0">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Food Lovers
        </p>
      </div>
    </footer>
  );
};

export default Footer;
