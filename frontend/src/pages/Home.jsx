import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getFoodImage } from '../utils/foodImages';
import VegIndicator from '../components/VegIndicator';
import {
  Utensils, Clock, Sparkles, ArrowRight, ShieldCheck, Flame,
  Percent, ShoppingBag, Plus, Check, Star, Pizza, Sandwich, Soup, Coffee, Cookie
} from 'lucide-react';

const CATEGORY_META = [
  { name: 'Burgers & Sandwiches', icon: Sandwich, count: '5 dishes', blurb: 'Vada Pav, Tikki Burgers & Kathi Rolls' },
  { name: 'Pizzas & Breads', icon: Pizza, count: '3 dishes', blurb: 'Tandoori Pizzas & Masala Garlic Bread' },
  { name: 'Main Course', icon: Soup, count: '5 dishes', blurb: 'Dum Biryanis & Butter Chicken Bowls' },
  { name: 'Starters & Appetizers', icon: Utensils, count: '4 dishes', blurb: 'Pav Bhaji, Peri-Peri Fries & Bhel' },
  { name: 'Desserts & Beverages', icon: Coffee, count: '5 dishes', blurb: 'Alphonso Mango Lassi & Masala Chai' },
];

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/menu-items?page=0&size=6&sortBy=id&sortDir=asc');
        setFeaturedItems(res.data.content || []);
      } catch (err) {
        console.error('Failed to load featured items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleAdd = async (item) => {
    const ok = await addToCart(item.id, 1);
    if (ok) {
      setAddedItemIds(prev => [...prev, item.id]);
      setTimeout(() => setAddedItemIds(prev => prev.filter(id => id !== item.id)), 1200);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* ─── 1. Hero Section: Two-Column Food-Focused Layout ─── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/40 to-stone-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-orange-950/30 border border-stone-200 dark:border-slate-800 p-6 sm:p-10 md:p-12 shadow-md dark:shadow-2xl transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic Indian Fast Food</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white leading-[1.15] tracking-tight">
              Crispy Vada Pavs, <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
                Dum Biryanis & Tandoori Melts
              </span>
            </h1>

            <p className="text-stone-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Experience the vibrant street flavors of Mumbai and Delhi cooked fresh with premium spices. Fast, hygienic, and delivered hot right to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/menu"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/orders"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-stone-50 dark:hover:bg-slate-700 font-bold text-sm border border-stone-200 dark:border-slate-700 transition-all shadow-sm"
              >
                Track Live Order
              </Link>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-semibold text-stone-600 dark:text-slate-400 border-t border-stone-200/80 dark:border-slate-800">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" /> ~30 min delivery</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9 (1.2k+ reviews)</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Quality checked</span>
            </div>
          </div>

          {/* Right Column: Hero Food Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-[4/3] bg-stone-100 dark:bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80"
                alt="Authentic Indian Dum Biryani with raita and spices"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-600 text-white inline-block mb-1">
                  Signature Dish
                </span>
                <p className="font-extrabold text-sm sm:text-base">Hyderabadi Chicken Biryani</p>
                <p className="text-xs text-stone-200 font-semibold">{formatCurrency(299)} • Slow-cooked saffron basmati</p>
              </div>
            </div>

            {/* Floating Highlight Card */}
            <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">Mumbai Vada Pav</p>
                <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(69)} only</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. Categories Visual Grid ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              Browse your favorite fast-food cravings by category
            </p>
          </div>
          <Link to="/menu" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {CATEGORY_META.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cat.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 3. Featured Bestsellers (Real Menu API) ─── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                Chef's Bestsellers
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              Most loved fast-food classics prepared fresh to order
            </p>
          </div>
          <Link
            to="/menu"
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Explore Menu
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-500 dark:text-slate-400 text-sm">
            Loading delicious Indian dishes...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredItems.map((item) => {
              const isAdded = addedItemIds.includes(item.id);
              const imgUrl = getFoodImage(item);
              return (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Food Photo Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-slate-800">
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <VegIndicator isVegetarian={item.isVegetarian} size="sm" />
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{item.preparationTimeMinutes || 15}m</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-stone-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h3>
                        <span className="font-black text-orange-600 dark:text-orange-400 text-sm whitespace-nowrap">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with Add CTA */}
                  <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-stone-100 dark:border-slate-800/80 mt-2">
                    <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                      {item.categoryName}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={!item.isAvailable}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                      }`}
                    >
                      {isAdded ? (
                        <><Check className="w-3.5 h-3.5" /><span>Added</span></>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" /><span>Add</span></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 4. Promotional Highlights Banner ─── */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Percent className="w-3.5 h-3.5" /> Special Launch Offer
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Get 20% OFF up to ₹100 on your first feast!
          </h2>
          <p className="text-orange-100 text-sm max-w-lg">
            Use code <strong className="bg-white/20 px-2 py-0.5 rounded text-white font-mono font-bold tracking-wider">WELCOME20</strong> at checkout on orders above ₹299.
          </p>
        </div>
        <Link
          to="/menu"
          className="px-6 py-3.5 rounded-2xl bg-white text-orange-600 hover:bg-stone-50 font-black text-sm shadow-lg whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
        >
          Claim Offer & Order Now
        </Link>
      </section>

    </div>
  );
};

export default Home;
