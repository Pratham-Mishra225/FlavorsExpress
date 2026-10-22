import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getFoodImage } from '../utils/foodImages';
import VegIndicator from '../components/VegIndicator';
import {
  Search, Plus, Minus, Utensils, ChevronLeft, ChevronRight,
  Clock, AlertCircle, RefreshCw, ShoppingBag, X, ArrowRight, Sparkles
} from 'lucide-react';

const PAGE_SIZE = 12;

const Menu = () => {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [pagedData, setPagedData] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0 });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(null); // null = all, true = veg, false = non-veg
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { cart, itemCount, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItems = cart?.cartItems || cart?.items || [];

  // Parse category from URL query parameters if present (e.g., from Homepage clicks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catNameParam = params.get('category');
    if (catNameParam && categories.length > 0) {
      const match = categories.find(c => c.name.toLowerCase() === catNameParam.toLowerCase());
      if (match) {
        setSelectedCategory(match.id);
      }
    }
  }, [location.search, categories]);

  // Fetch categories once on mount
  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(r.data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        size: PAGE_SIZE,
        sortBy: 'name',
        sortDir: 'asc',
      });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (vegFilter !== null) params.append('isVegetarian', vegFilter);
      if (selectedCategory !== null) params.append('categoryId', selectedCategory);

      const res = await api.get(`/menu-items?${params.toString()}`);
      setPagedData(res.data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setError(err.response?.data?.message || 'Failed to load menu items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, vegFilter, selectedCategory]);

  useEffect(() => {
    setPage(0); // Reset to first page on filter change
  }, [searchQuery, vegFilter, selectedCategory]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setVegFilter(null);
    setPage(0);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== null || vegFilter !== null;
  const filteredItems = pagedData.content || [];

  return (
    <div className="space-y-8 pb-20">

      {/* ── Header ── */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Authentic Flavors</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
          Indian Fast-Food Menu
        </h1>
        <p className="text-stone-600 dark:text-slate-400 text-sm leading-relaxed">
          Fresh Mumbai street-food favorites, griddled burgers, tandoori pizzas, and royal dum biryanis—prepared to order.
        </p>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-4">
        
        {/* Search bar & Veg toggles */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes (e.g., Vada Pav, Biryani, Paneer Tikka)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 rounded-2xl pl-10 pr-10 py-2.5 text-stone-900 dark:text-slate-100 text-sm outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setVegFilter(null)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                vegFilter === null
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setVegFilter(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                vegFilter === true
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              <VegIndicator isVegetarian={true} size="sm" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setVegFilter(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                vegFilter === false
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              <VegIndicator isVegetarian={false} size="sm" />
              <span>Non-Veg</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Categories Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === null
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                : 'bg-stone-100 text-stone-700 dark:bg-slate-800/80 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'bg-stone-100 text-stone-700 dark:bg-slate-800/80 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchMenuItems}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ── Menu Items Grid ── */}
      {loading ? (
        <div className="text-center py-20 text-stone-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
          <p className="text-sm font-semibold">Loading dishes...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <Utensils className="w-12 h-12 text-stone-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-slate-200">No matching dishes found</h3>
          <p className="text-stone-500 dark:text-slate-400 text-xs">
            Try adjusting your search keywords or dietary filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const imgUrl = getFoodImage(item);
            // Check if item is already in cart
            const cartItem = cartItems.find(
              ci => ci.menuItemId === item.id || ci.menuItem?.id === item.id
            );
            const inCartQuantity = cartItem?.quantity || 0;

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
                    {/* Veg/Non-veg icon badge */}
                    <div className="absolute top-3 left-3 shadow-md">
                      <VegIndicator isVegetarian={item.isVegetarian} size="sm" />
                    </div>

                    {/* Prep time badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{item.preparationTimeMinutes || 15}m</span>
                    </div>

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-stone-900 dark:text-white text-base leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className="font-black text-orange-600 dark:text-orange-400 text-base whitespace-nowrap">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    {item.categoryName && (
                      <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider block">
                        {item.categoryName}
                      </span>
                    )}

                    <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
                      {item.description || 'Prepared fresh with signature Indian spices and traditional cooking techniques.'}
                    </p>
                  </div>
                </div>

                {/* Footer action: Add button or Quantity Stepper */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-stone-100 dark:border-slate-800/80 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    item.isAvailable
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>

                  {item.isAvailable ? (
                    inCartQuantity > 0 ? (
                      /* Quantity Stepper when in cart */
                      <div className="flex items-center bg-orange-50 dark:bg-orange-500/15 border border-orange-300 dark:border-orange-500/40 rounded-xl p-0.5 shadow-sm">
                        <button
                          onClick={() => {
                            if (inCartQuantity <= 1) {
                              removeFromCart(cartItem.id);
                            } else {
                              updateQuantity(cartItem.id, item.id, inCartQuantity - 1);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-orange-600 dark:text-orange-400">
                          {inCartQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.id, item.id, inCartQuantity + 1)}
                          className="w-7 h-7 rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Add to Cart button when not in cart */
                      <button
                        onClick={() => addToCart(item.id, 1)}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-slate-600 cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {pagedData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagedData.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                i === page
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(pagedData.totalPages - 1, p + 1))}
            disabled={pagedData.last || page >= pagedData.totalPages - 1}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Floating Sticky Cart Bar (When Cart Has Items) ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-5 left-4 right-4 max-w-xl mx-auto z-40 animate-fade-in-up">
          <Link
            to="/cart"
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl flex items-center justify-between border border-white/20 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-100">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                </p>
                <p className="text-base font-black">
                  {formatCurrency(cart?.totalAmount || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-extrabold text-sm bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-xl backdrop-blur-md transition-colors">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

    </div>
  );
};

export default Menu;
