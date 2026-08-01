import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ShieldCheck, Clock, Sparkles, ArrowRight, Truck } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-orange-950/40 border border-slate-800 p-8 sm:p-12 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Single Chain Gourmet Kitchen
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Delicious Food <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Delivered Express Fast
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Savor authentic, chef-prepared delicacies crafted with premium ingredients. Order online now and track your meal from our kitchen to your doorstep.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/menu"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-orange-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Chef Crafted Meals</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Freshly prepared dishes made with handpicked ingredients daily by master chefs.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-orange-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Swift Delivery</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Real-time status updates from preparation to out-for-delivery in under 30 mins.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-orange-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Quality Assured</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Hygienically packaged with temperature-controlled thermal delivery bags.
          </p>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-orange-900/40 to-slate-900 border border-orange-500/30 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white">Hungry? Check out today's special menu!</h2>
          <p className="text-sm text-slate-300">Browse categories ranging from starters to desserts.</p>
        </div>
        <Link
          to="/menu"
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 whitespace-nowrap transition-colors"
        >
          View Full Menu
        </Link>
      </section>

    </div>
  );
};

export default Home;
