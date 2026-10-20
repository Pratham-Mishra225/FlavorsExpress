import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { Search, Plus, Check, Utensils, ChevronLeft, ChevronRight, Leaf, Drumstick, AlertCircle, RefreshCw } from 'lucide-react';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [pagedData, setPagedData] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0 });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(null); // null = all, true = veg, false = non-veg
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedItemIds, setAddedItemIds] = useState([]);

  const PAGE_SIZE = 12;
  const { addToCart } = useCart();

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

      const res = await api.get(`/menu-items?${params.toString()}`);
      setPagedData(res.data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setError(err.response?.data?.message || 'Failed to load menu items. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, vegFilter]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setPage(0); // reset to first page when filters change
  }, [searchQuery, vegFilter]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleAddToCart = async (item) => {
    const success = await addToCart(item.id, 1);
    if (success) {
      setAddedItemIds(prev => [...prev, item.id]);
      setTimeout(() => setAddedItemIds(prev => prev.filter(id => id !== item.id)), 1500);
    }
  };

  // Client-side category filter applied on top of server-side results
  const filteredItems = selectedCategory
    ? pagedData.content.filter(item => item.categoryId === selectedCategory)
    : pagedData.content;

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Our Signature Menu</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Explore delicious dishes, prepared fresh to order with the finest ingredients.
        </p>
        {pagedData.totalElements > 0 && (
          <p className="text-slate-500 text-xs">{pagedData.totalElements} items available</p>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl pl-11 pr-4 py-2 text-slate-200 text-sm outline-none transition-all"
            />
          </div>

          {/* Veg / Non-Veg Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVegFilter(null)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                vegFilter === null ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >All</button>
            <button
              onClick={() => setVegFilter(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                vegFilter === true ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" /> Veg
            </button>
            <button
              onClick={() => setVegFilter(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                vegFilter === false ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Drumstick className="w-3.5 h-3.5" /> Non-Veg
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >All Items</button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >{cat.name}</button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading delicious items...</div>
      ) : error ? (
        <div className="text-center py-16 bg-rose-950/20 rounded-2xl border border-rose-800/80 p-8 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-rose-300">Unable to load menu</h3>
          <p className="text-rose-400 text-xs mt-1 mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <Utensils className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No menu items found</h3>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isAdded = addedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/40 transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                      {/* Veg / Non-Veg indicator dot */}
                      <span className={`inline-block w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.isVegetarian ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'}`} />
                      {item.name}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Category & prep time */}
                  <div className="flex items-center gap-2 mb-3">
                    {item.categoryName && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">{item.categoryName}</span>
                    )}
                    {item.preparationTimeMinutes && (
                      <span className="text-[10px] text-slate-500">⏱ {item.preparationTimeMinutes} min</span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                    {item.description || 'Prepared fresh with signature spices and traditional cooking techniques.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                    item.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </span>

                  <button
                    disabled={!item.isAvailable}
                    onClick={() => handleAddToCart(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      isAdded ? 'bg-emerald-600 text-white'
                      : item.isAvailable ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAdded ? (
                      <><Check className="w-4 h-4" /><span>Added!</span></>
                    ) : (
                      <><Plus className="w-4 h-4" /><span>Add to Cart</span></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagedData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagedData.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                i === page ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >{i + 1}</button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(pagedData.totalPages - 1, p + 1))}
            disabled={pagedData.last || page === pagedData.totalPages - 1}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Menu;
