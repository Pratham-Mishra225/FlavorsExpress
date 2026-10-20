import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Shield, Utensils, Tag, Truck, PackageCheck, Plus, Trash2, RefreshCw,
  BarChart3, TrendingUp, Users, Bike, ShoppingCart, DollarSign, Ticket, ChevronLeft, ChevronRight, Leaf, Drumstick
} from 'lucide-react';

// ─── Helper Components ───────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuPage, setMenuPage] = useState(0);
  const [menuPaged, setMenuPaged] = useState({ totalPages: 0, totalElements: 0, last: true });
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', price: '', categoryId: '', isAvailable: true, isVegetarian: false, preparationTimeMinutes: 15 });
  const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '', status: 'AVAILABLE', password: '' });
  const [newPromo, setNewPromo] = useState({ code: '', discountPercentage: '', maxDiscountAmount: '', minOrderAmount: '', usageLimit: '', expiryDate: '', isActive: true });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/analytics/admin');
        setAnalytics(res.data);
      } else if (activeTab === 'orders') {
        const statuses = ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const results = await Promise.all(statuses.map(s => api.get(`/orders/status/${s}`)));
        setOrders(results.flatMap(r => r.data));
        const pRes = await api.get('/delivery-partners');
        setPartners(pRes.data);
      } else if (activeTab === 'menu') {
        const [mRes, cRes] = await Promise.all([
          api.get(`/menu-items?page=${menuPage}&size=8&sortBy=name&sortDir=asc`),
          api.get('/categories'),
        ]);
        setMenuItems(mRes.data.content);
        setMenuPaged({ totalPages: mRes.data.totalPages, totalElements: mRes.data.totalElements, last: mRes.data.last });
        setCategories(cRes.data);
      } else if (activeTab === 'categories') {
        const cRes = await api.get('/categories');
        setCategories(cRes.data);
      } else if (activeTab === 'partners') {
        const pRes = await api.get('/delivery-partners');
        setPartners(pRes.data);
      } else if (activeTab === 'promos') {
        const res = await api.get('/promo-codes');
        setPromoCodes(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, menuPage]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Category Actions ────────────────────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { name: newCatName.trim() });
      setNewCatName('');
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add category'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try { await api.delete(`/categories/${id}`); loadData(); }
    catch (err) { alert('Failed to delete category'); }
  };

  // ── Menu Actions ────────────────────────────────────────────────────────────
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu-items', {
        ...newMenuItem,
        price: parseFloat(newMenuItem.price),
        categoryId: parseInt(newMenuItem.categoryId),
        preparationTimeMinutes: parseInt(newMenuItem.preparationTimeMinutes),
      });
      setNewMenuItem({ name: '', description: '', price: '', categoryId: '', isAvailable: true, isVegetarian: false, preparationTimeMinutes: 15 });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create menu item'); }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Delete menu item?')) return;
    try { await api.delete(`/menu-items/${id}`); loadData(); }
    catch (err) { alert('Failed to delete menu item'); }
  };

  // ── Partner Actions ─────────────────────────────────────────────────────────
  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      await api.post('/delivery-partners', newPartner);
      setNewPartner({ name: '', email: '', phone: '', status: 'AVAILABLE', password: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create delivery partner'); }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Delete delivery partner?')) return;
    try { await api.delete(`/delivery-partners/${id}`); loadData(); }
    catch (err) { alert('Failed to delete delivery partner'); }
  };

  // ── Order Actions ───────────────────────────────────────────────────────────
  const handleAutoAssign = async (orderId) => {
    try { await api.put(`/orders/${orderId}/assign-automatic`); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Auto assign failed'); }
  };

  const handleManualAssign = async (orderId, partnerId) => {
    if (!partnerId) return;
    try { await api.put(`/orders/${orderId}/assign-manual/${partnerId}`); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Manual assign failed'); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try { await api.put(`/orders/${orderId}/status?status=${status}`); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Status update failed'); }
  };

  // ── Promo Actions ───────────────────────────────────────────────────────────
  const handleAddPromo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/promo-codes', {
        ...newPromo,
        discountPercentage: parseFloat(newPromo.discountPercentage),
        maxDiscountAmount: parseFloat(newPromo.maxDiscountAmount),
        minOrderAmount: parseFloat(newPromo.minOrderAmount),
        usageLimit: parseInt(newPromo.usageLimit),
        expiryDate: new Date(newPromo.expiryDate).toISOString(),
      });
      setNewPromo({ code: '', discountPercentage: '', maxDiscountAmount: '', minOrderAmount: '', usageLimit: '', expiryDate: '', isActive: true });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create promo code'); }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Delete promo code?')) return;
    try { await api.delete(`/promo-codes/${id}`); loadData(); }
    catch (err) { alert('Failed to delete promo code'); }
  };

  const inputCls = 'w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-all';

  const TABS = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'orders', label: 'Orders', icon: PackageCheck },
    { key: 'menu', label: 'Menu Items', icon: Utensils },
    { key: 'categories', label: 'Categories', icon: Tag },
    { key: 'partners', label: 'Partners', icon: Truck },
    { key: 'promos', label: 'Promo Codes', icon: Ticket },
  ];

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Operations Control</h1>
            <p className="text-slate-400 text-sm">Manage restaurant menus, categories, delivery partners &amp; orders</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === key ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ── 1. ANALYTICS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-white">Business Overview</h3>
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading analytics...</div>
          ) : analytics ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard icon={ShoppingCart} label="Total Orders" value={analytics.totalOrders} color="bg-blue-500/10 text-blue-400" />
                <KpiCard icon={DollarSign} label="Total Revenue" value={`$${Number(analytics.totalRevenue).toFixed(2)}`} color="bg-emerald-500/10 text-emerald-400" />
                <KpiCard icon={TrendingUp} label="Orders Today" value={analytics.ordersToday} sub={`$${Number(analytics.revenueToday).toFixed(2)} today`} color="bg-orange-500/10 text-orange-400" />
                <KpiCard icon={Users} label="Total Customers" value={analytics.totalCustomers} color="bg-purple-500/10 text-purple-400" />
                <KpiCard icon={Bike} label="Active Partners" value={analytics.activeDeliveryPartners} color="bg-cyan-500/10 text-cyan-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-white text-base">Orders by Status</h4>
                  {analytics.ordersByStatus && Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-bold text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded-lg">{count}</span>
                    </div>
                  ))}
                </div>

                {/* Top Menu Items */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-white text-base">🏆 Top Selling Items</h4>
                  {analytics.topMenuItems?.length ? analytics.topMenuItems.map((item, idx) => (
                    <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>{idx + 1}</span>
                        <span className="text-slate-300 truncate max-w-[150px]">{item.menuItemName}</span>
                      </div>
                      <span className="font-bold text-slate-200">{item.totalQuantitySold} sold</span>
                    </div>
                  )) : <p className="text-slate-500 text-xs">No sales data yet.</p>}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm">No analytics data available.</p>
          )}
        </div>
      )}

      {/* ── 2. ORDERS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Live Orders Dispatch</h3>
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">No active orders</div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs text-slate-500">Order ID</span>
                      <h4 className="font-bold text-white text-base">#{ord.id}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">{ord.status}</span>
                      <span className="text-sm font-extrabold text-orange-400">${Number(ord.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                    <div>
                      <p><strong>Address:</strong> {ord.deliveryAddress}</p>
                      <p className="mt-1"><strong>Partner:</strong> {ord.deliveryPartnerId ? `#${ord.deliveryPartnerId}` : 'Unassigned'}</p>
                      {ord.promoCode && <p className="mt-1 text-amber-400"><strong>Promo:</strong> {ord.promoCode}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {!ord.deliveryPartnerId && (
                        <>
                          <button onClick={() => handleAutoAssign(ord.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">⚡ Auto Assign</button>
                          <select onChange={(e) => handleManualAssign(ord.id, e.target.value)} defaultValue="" className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5">
                            <option value="" disabled>Manual Assign...</option>
                            {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.status})</option>)}
                          </select>
                        </>
                      )}
                      <select value={ord.status} onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 font-semibold">
                        {['PLACED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. MENU ITEMS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
            <h3 className="text-lg font-bold text-white">Add Menu Item</h3>
            <form onSubmit={handleAddMenuItem} className="space-y-3">
              <input required placeholder="Item Name" value={newMenuItem.name} onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} className={inputCls} />
              <textarea placeholder="Description" value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Price ($)" value={newMenuItem.price} onChange={e => setNewMenuItem({...newMenuItem, price: e.target.value})} className={inputCls} />
              <input type="number" required placeholder="Prep Time (minutes)" value={newMenuItem.preparationTimeMinutes} onChange={e => setNewMenuItem({...newMenuItem, preparationTimeMinutes: e.target.value})} className={inputCls} />
              <select required value={newMenuItem.categoryId} onChange={e => setNewMenuItem({...newMenuItem, categoryId: e.target.value})} className={inputCls}>
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={newMenuItem.isVegetarian} onChange={e => setNewMenuItem({...newMenuItem, isVegetarian: e.target.checked})} className="accent-emerald-500 w-4 h-4" />
                <Leaf className="w-4 h-4 text-emerald-400" /> Vegetarian
              </label>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md">Create Item</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-white">Menu Items {menuPaged.totalElements > 0 && `(${menuPaged.totalElements})`}</h3>
            {menuItems.map((item) => (
              <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm border ${item.isVegetarian ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'}`} />
                    <h4 className="font-bold text-white text-base">{item.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-amber-400 font-bold">${Number(item.price).toFixed(2)}</span>
                    {item.preparationTimeMinutes && <span className="text-xs text-slate-500">⏱ {item.preparationTimeMinutes} min</span>}
                    {item.categoryName && <span className="text-xs text-slate-500">{item.categoryName}</span>}
                  </div>
                </div>
                <button onClick={() => handleDeleteMenuItem(item.id)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {menuPaged.totalPages > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setMenuPage(p => Math.max(0, p-1))} disabled={menuPage === 0} className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs text-slate-400">Page {menuPage+1} / {menuPaged.totalPages}</span>
                <button onClick={() => setMenuPage(p => Math.min(menuPaged.totalPages-1, p+1))} disabled={menuPaged.last} className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. CATEGORIES TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 h-fit">
            <h3 className="text-lg font-bold text-white">Add Category</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input required placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 outline-none" />
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-xl">Add</button>
            </form>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">All Categories</h3>
            {categories.map(c => (
              <div key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">{c.name}</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. DELIVERY PARTNERS TAB ──────────────────────────────────────────── */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
            <h3 className="text-lg font-bold text-white">Register Partner</h3>
            <form onSubmit={handleAddPartner} className="space-y-3">
              <input required placeholder="Partner Name" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} className={inputCls} />
              <input type="email" required placeholder="Email Address" value={newPartner.email} onChange={e => setNewPartner({...newPartner, email: e.target.value})} className={inputCls} />
              <input type="tel" required placeholder="Phone Number" value={newPartner.phone} onChange={e => setNewPartner({...newPartner, phone: e.target.value})} className={inputCls} />
              <input type="password" placeholder="Initial Password (default: PartnerPass123!)" value={newPartner.password || ''} onChange={e => setNewPartner({...newPartner, password: e.target.value})} className={inputCls} />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md">Register Partner</button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-white">Registered Partners</h3>
            {partners.map(p => (
              <div key={p.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.email} · {p.phone} · {p.vehicleNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{p.status}</span>
                  <button onClick={() => handleDeletePartner(p.id)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. PROMO CODES TAB ────────────────────────────────────────────────── */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Ticket className="w-5 h-5 text-amber-400" /> Create Promo Code</h3>
            <form onSubmit={handleAddPromo} className="space-y-3">
              <input required placeholder="Code (e.g. SAVE20)" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Discount %" value={newPromo.discountPercentage} onChange={e => setNewPromo({...newPromo, discountPercentage: e.target.value})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Max Discount Amount ($)" value={newPromo.maxDiscountAmount} onChange={e => setNewPromo({...newPromo, maxDiscountAmount: e.target.value})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Min Order Amount ($)" value={newPromo.minOrderAmount} onChange={e => setNewPromo({...newPromo, minOrderAmount: e.target.value})} className={inputCls} />
              <input type="number" required placeholder="Usage Limit" value={newPromo.usageLimit} onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} className={inputCls} />
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Expiry Date &amp; Time</label>
                <input type="datetime-local" required value={newPromo.expiryDate} onChange={e => setNewPromo({...newPromo, expiryDate: e.target.value})} className={inputCls} />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm shadow-md">Create Promo Code</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-white">All Promo Codes</h3>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-sm">No promo codes yet</div>
            ) : promoCodes.map(p => (
              <div key={p.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-amber-400 text-base tracking-widest">{p.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                    <span><strong className="text-slate-300">Discount:</strong> {p.discountPercentage}%</span>
                    <span><strong className="text-slate-300">Max off:</strong> ${p.maxDiscountAmount}</span>
                    <span><strong className="text-slate-300">Min order:</strong> ${p.minOrderAmount}</span>
                    <span><strong className="text-slate-300">Usage:</strong> {p.usedCount}/{p.usageLimit}</span>
                    <span className="col-span-2"><strong className="text-slate-300">Expires:</strong> {p.expiryDate ? new Date(p.expiryDate).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <button onClick={() => handleDeletePromo(p.id)} className="p-2 text-slate-500 hover:text-rose-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
