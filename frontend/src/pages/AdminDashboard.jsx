import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/currency';
import {
  Shield, Utensils, Tag, Truck, PackageCheck, Plus, Trash2, RefreshCw,
  BarChart3, TrendingUp, Users, Bike, ShoppingCart, IndianRupee, Ticket, ChevronLeft, ChevronRight, Leaf
} from 'lucide-react';

// ─── Helper Components ───────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-lg transition-colors">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-stone-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">{sub}</p>}
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
  const [orderActionLoading, setOrderActionLoading] = useState(null);
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerMessage, setPartnerMessage] = useState(null); // { type: 'success'|'error', text }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/analytics/admin');
        setAnalytics(res.data);
      } else if (activeTab === 'orders') {
        const [oRes, pRes] = await Promise.all([
          api.get('/orders'),
          api.get('/delivery-partners'),
        ]);
        setOrders(oRes.data);
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
    setPartnerMessage(null);

    // Frontend password validation
    if (!newPartner.password || newPartner.password.trim().length < 6) {
      setPartnerMessage({ type: 'error', text: 'Initial password must be at least 6 characters.' });
      return;
    }

    setPartnerSubmitting(true);
    try {
      const payload = {
        ...newPartner,
        email: newPartner.email.trim().toLowerCase(),
        name: newPartner.name.trim(),
        phone: newPartner.phone.trim(),
        password: newPartner.password.trim(),
      };
      await api.post('/delivery-partners', payload);
      const createdEmail = payload.email;
      setNewPartner({ name: '', email: '', phone: '', status: 'AVAILABLE', password: '' });
      setPartnerMessage({
        type: 'success',
        text: `Partner account created. Login email: ${createdEmail} — they can now sign in with the password you set.`,
      });
      loadData();
    } catch (err) {
      setPartnerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create delivery partner.' });
    } finally {
      setPartnerSubmitting(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Delete delivery partner?')) return;
    try { await api.delete(`/delivery-partners/${id}`); loadData(); }
    catch (err) { alert('Failed to delete delivery partner'); }
  };

  // ── Order Actions ───────────────────────────────────────────────────────────
  const handleAutoAssign = async (orderId) => {
    setOrderActionLoading(orderId);
    try {
      await api.put(`/orders/${orderId}/assign-automatic`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Auto assign failed');
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleManualAssign = async (orderId, partnerId) => {
    if (!partnerId) return;
    setOrderActionLoading(orderId);
    try {
      await api.put(`/orders/${orderId}/assign-manual/${partnerId}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Manual assign failed');
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setOrderActionLoading(orderId);
    try {
      await api.put(`/orders/${orderId}/status?status=${status}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setOrderActionLoading(null);
    }
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

  const inputCls = 'w-full bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 outline-none transition-all';

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
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Admin Operations Control
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              Manage Indian fast-food menus, categories, delivery dispatch &amp; revenue
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === key
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-stone-100 text-stone-600 dark:bg-slate-900 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ── 1. ANALYTICS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Business Overview</h3>
          {loading ? (
            <div className="text-center py-10 text-stone-500 dark:text-slate-400">Loading analytics...</div>
          ) : analytics ? (
            <>
              {/* KPI Cards in INR */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard icon={ShoppingCart} label="Total Orders" value={analytics.totalOrders} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
                <KpiCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(analytics.totalRevenue)} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
                <KpiCard icon={TrendingUp} label="Orders Today" value={analytics.ordersToday} sub={`${formatCurrency(analytics.revenueToday)} today`} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
                <KpiCard icon={Users} label="Total Customers" value={analytics.totalCustomers} color="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" />
                <KpiCard icon={Bike} label="Active Partners" value={analytics.activeDeliveryPartners} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="font-black text-stone-900 dark:text-white text-base">Orders by Status</h4>
                  {analytics.ordersByStatus && Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-stone-600 dark:text-slate-400 capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-bold text-stone-800 dark:text-slate-200 bg-stone-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">{count}</span>
                    </div>
                  ))}
                </div>

                {/* Top Menu Items */}
                <div className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="font-black text-stone-900 dark:text-white text-base">🏆 Top Selling Items</h4>
                  {analytics.topMenuItems?.length ? analytics.topMenuItems.map((item, idx) => (
                    <div key={item.menuItemId} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400'}`}>{idx + 1}</span>
                        <span className="text-stone-800 dark:text-slate-300 font-semibold truncate max-w-[170px]">{item.menuItemName}</span>
                      </div>
                      <span className="font-extrabold text-stone-900 dark:text-slate-200">{item.totalQuantitySold} sold</span>
                    </div>
                  )) : <p className="text-stone-400 text-xs">No sales data yet.</p>}
                </div>
              </div>
            </>
          ) : (
            <p className="text-stone-500 text-sm">No analytics data available.</p>
          )}
        </div>
      )}

      {/* ── 2. ORDERS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Live Orders Dispatch</h3>
          {loading ? (
            <div className="text-center py-10 text-stone-500 dark:text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900/40 rounded-2xl border border-stone-200 dark:border-slate-800 text-stone-500 text-sm">No orders recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const isActionBusy = orderActionLoading === ord.id;
                let statusColor = 'bg-stone-100 text-stone-600 border-stone-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
                if (ord.status === 'PLACED') statusColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
                if (ord.status === 'PREPARING') statusColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
                if (ord.status === 'READY') statusColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
                if (ord.status === 'OUT_FOR_DELIVERY') statusColor = 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20';
                if (ord.status === 'DELIVERED') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
                if (ord.status === 'CANCELLED') statusColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';

                return (
                  <div key={ord.id} className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Order ID</span>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-stone-900 dark:text-white text-base">#{ord.id}</h4>
                          <span className="text-xs text-stone-500 dark:text-slate-400">
                            · {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'Recently placed'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${statusColor}`}>
                          {ord.status}
                        </span>
                        <span className="text-base font-black text-orange-600 dark:text-orange-400">
                          {formatCurrency(ord.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Delivery Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700 dark:text-slate-300 bg-stone-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-stone-200 dark:border-slate-800/60">
                      <div className="space-y-1">
                        <p>
                          <strong className="text-stone-900 dark:text-slate-400">Customer:</strong>{' '}
                          <span className="font-bold">{ord.customerName || `Customer #${ord.customerId}`}</span>
                          {ord.customerPhone && <span className="text-stone-500 dark:text-slate-400"> ({ord.customerPhone})</span>}
                        </p>
                        {ord.customerEmail && (
                          <p><strong className="text-stone-900 dark:text-slate-400">Email:</strong> {ord.customerEmail}</p>
                        )}
                        <p><strong className="text-stone-900 dark:text-slate-400">Address:</strong> {ord.deliveryAddress}</p>
                      </div>
                      <div className="space-y-1">
                        <p>
                          <strong className="text-stone-900 dark:text-slate-400">Delivery Partner:</strong>{' '}
                          <span className={ord.deliveryPartnerName ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-stone-400 dark:text-slate-500'}>
                            {ord.deliveryPartnerName
                              ? `${ord.deliveryPartnerName} (#${ord.deliveryPartnerId})`
                              : 'Unassigned'}
                          </span>
                        </p>
                        {ord.promoCode && (
                          <p className="text-amber-600 dark:text-amber-400"><strong className="text-stone-900 dark:text-slate-400">Promo Code:</strong> {ord.promoCode}</p>
                        )}
                        <p><strong className="text-stone-900 dark:text-slate-400">Payment:</strong> {ord.paymentStatus || 'PENDING'}</p>
                      </div>
                    </div>

                    {/* Ordered Items Summary in INR */}
                    <div className="text-xs">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                        Items Ordered ({ord.orderItems?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ord.orderItems?.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-stone-800 dark:text-slate-200 text-xs"
                          >
                            <span className="font-semibold">{item.menuItemName}</span>
                            <span className="text-orange-600 dark:text-orange-400 font-black">×{item.quantity}</span>
                            <span className="text-stone-500 dark:text-slate-500">({formatCurrency(item.price * item.quantity)})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-stone-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2.5 justify-end">
                      {ord.status === 'PLACED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                          disabled={isActionBusy}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isActionBusy ? 'Updating...' : '👨‍🍳 Start Preparing'}
                        </button>
                      )}

                      {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => handleAutoAssign(ord.id)}
                            disabled={isActionBusy || !!ord.deliveryPartnerId}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              ord.deliveryPartnerId
                                ? 'bg-stone-200 text-stone-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                            }`}
                            title={ord.deliveryPartnerId ? 'Partner already assigned' : 'Auto-assign available partner'}
                          >
                            {isActionBusy ? 'Assigning...' : '⚡ Auto Assign'}
                          </button>

                          <select
                            onChange={(e) => handleManualAssign(ord.id, e.target.value)}
                            disabled={isActionBusy || ord.status === 'OUT_FOR_DELIVERY'}
                            value={ord.deliveryPartnerId || ''}
                            className="bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-stone-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-orange-500 outline-none"
                          >
                            <option value="" disabled>
                              {ord.deliveryPartnerId ? 'Reassign Partner...' : 'Manual Assign...'}
                            </option>
                            {partners.map((p) => (
                              <option key={p.id} value={p.id} disabled={p.status !== 'AVAILABLE' && p.id !== ord.deliveryPartnerId}>
                                {p.name} ({p.status}){p.id === ord.deliveryPartnerId ? ' — Currently Assigned' : ''}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          disabled={isActionBusy}
                          className="bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-stone-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 font-bold focus:border-orange-500 outline-none cursor-pointer"
                        >
                          {ord.status === 'PLACED' && (
                            <>
                              <option value="PLACED">PLACED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </>
                          )}
                          {ord.status === 'PREPARING' && (
                            <>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY">READY</option>
                              <option value="OUT_FOR_DELIVERY" disabled={!ord.deliveryPartnerId}>
                                OUT_FOR_DELIVERY {!ord.deliveryPartnerId ? '(Need Partner)' : ''}
                              </option>
                              <option value="CANCELLED">CANCELLED</option>
                            </>
                          )}
                          {ord.status === 'READY' && (
                            <>
                              <option value="READY">READY</option>
                              <option value="OUT_FOR_DELIVERY" disabled={!ord.deliveryPartnerId}>
                                OUT_FOR_DELIVERY {!ord.deliveryPartnerId ? '(Need Partner)' : ''}
                              </option>
                              <option value="CANCELLED">CANCELLED</option>
                            </>
                          )}
                          {ord.status === 'OUT_FOR_DELIVERY' && (
                            <>
                              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                            </>
                          )}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. MENU ITEMS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 h-fit space-y-4 shadow-sm">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">Add Menu Item</h3>
            <form onSubmit={handleAddMenuItem} className="space-y-3">
              <input required placeholder="Item Name" value={newMenuItem.name} onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} className={inputCls} />
              <textarea placeholder="Description" value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Price (₹)" value={newMenuItem.price} onChange={e => setNewMenuItem({...newMenuItem, price: e.target.value})} className={inputCls} />
              <input type="number" required placeholder="Prep Time (minutes)" value={newMenuItem.preparationTimeMinutes} onChange={e => setNewMenuItem({...newMenuItem, preparationTimeMinutes: e.target.value})} className={inputCls} />
              <select required value={newMenuItem.categoryId} onChange={e => setNewMenuItem({...newMenuItem, categoryId: e.target.value})} className={inputCls}>
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={newMenuItem.isVegetarian} onChange={e => setNewMenuItem({...newMenuItem, isVegetarian: e.target.checked})} className="accent-emerald-600 w-4 h-4" />
                <Leaf className="w-4 h-4 text-emerald-600" /> Vegetarian
              </label>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md cursor-pointer">Create Item</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">Menu Items {menuPaged.totalElements > 0 && `(${menuPaged.totalElements})`}</h3>
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm border ${item.isVegetarian ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'}`} />
                    <h4 className="font-extrabold text-stone-900 dark:text-white text-base">{item.name}</h4>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-orange-600 dark:text-amber-400 font-extrabold">{formatCurrency(item.price)}</span>
                    {item.preparationTimeMinutes && <span className="text-xs text-stone-400 dark:text-slate-500">⏱ {item.preparationTimeMinutes} min</span>}
                    {item.categoryName && <span className="text-xs text-stone-400 dark:text-slate-500">· {item.categoryName}</span>}
                  </div>
                </div>
                <button onClick={() => handleDeleteMenuItem(item.id)} className="p-2 text-stone-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {menuPaged.totalPages > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setMenuPage(p => Math.max(0, p-1))} disabled={menuPage === 0} className="p-2 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs text-stone-500 dark:text-slate-400">Page {menuPage+1} / {menuPaged.totalPages}</span>
                <button onClick={() => setMenuPage(p => Math.min(menuPaged.totalPages-1, p+1))} disabled={menuPaged.last} className="p-2 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. CATEGORIES TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 h-fit shadow-sm">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">Add Category</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input required placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-stone-900 dark:text-slate-200 outline-none" />
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-xl cursor-pointer">Add</button>
            </form>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">All Categories</h3>
            {categories.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <span className="font-bold text-stone-800 dark:text-slate-200 text-sm">{c.name}</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-stone-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. DELIVERY PARTNERS TAB ──────────────────────────────────────────── */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 h-fit space-y-4 shadow-sm">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">Register Partner</h3>

            {/* Success / Error Message */}
            {partnerMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold border ${
                partnerMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}>
                {partnerMessage.text}
              </div>
            )}

            <form onSubmit={handleAddPartner} className="space-y-3">
              <input required placeholder="Partner Name" value={newPartner.name} onChange={e => { setNewPartner({...newPartner, name: e.target.value}); setPartnerMessage(null); }} className={inputCls} />
              <input type="email" required placeholder="Email Address" value={newPartner.email} onChange={e => { setNewPartner({...newPartner, email: e.target.value}); setPartnerMessage(null); }} className={inputCls} />
              <input type="tel" required placeholder="Phone Number" value={newPartner.phone} onChange={e => { setNewPartner({...newPartner, phone: e.target.value}); setPartnerMessage(null); }} className={inputCls} />
              <div>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Initial Login Password (min 6 chars)"
                  value={newPartner.password || ''}
                  onChange={e => { setNewPartner({...newPartner, password: e.target.value}); setPartnerMessage(null); }}
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-stone-400 dark:text-slate-500">
                  The partner will use this password to sign in at the Delivery Partner login.
                </p>
              </div>
              <button
                type="submit"
                disabled={partnerSubmitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
              >
                {partnerSubmitting ? 'Registering…' : 'Register Partner'}
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">Registered Partners</h3>
            {partners.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-extrabold text-stone-900 dark:text-white text-base">{p.name}</h4>
                  <p className="text-xs text-stone-500 dark:text-slate-400">{p.email} · {p.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    p.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                    p.status === 'BUSY' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                    'bg-stone-100 text-stone-600 border-stone-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>{p.status}</span>
                  <button onClick={() => handleDeletePartner(p.id)} className="p-2 text-stone-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. PROMO CODES TAB ────────────────────────────────────────────────── */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 h-fit space-y-4 shadow-sm">
            <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2"><Ticket className="w-5 h-5 text-amber-500" /> Create Promo Code</h3>
            <form onSubmit={handleAddPromo} className="space-y-3">
              <input required placeholder="Code (e.g. FESTIVE25)" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Discount %" value={newPromo.discountPercentage} onChange={e => setNewPromo({...newPromo, discountPercentage: e.target.value})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Max Discount Amount (₹)" value={newPromo.maxDiscountAmount} onChange={e => setNewPromo({...newPromo, maxDiscountAmount: e.target.value})} className={inputCls} />
              <input type="number" step="0.01" required placeholder="Min Order Amount (₹)" value={newPromo.minOrderAmount} onChange={e => setNewPromo({...newPromo, minOrderAmount: e.target.value})} className={inputCls} />
              <input type="number" required placeholder="Usage Limit" value={newPromo.usageLimit} onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} className={inputCls} />
              <div>
                <label className="text-xs text-stone-500 dark:text-slate-400 mb-1 block">Expiry Date &amp; Time</label>
                <input type="datetime-local" required value={newPromo.expiryDate} onChange={e => setNewPromo({...newPromo, expiryDate: e.target.value})} className={inputCls} />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-md cursor-pointer">Create Promo Code</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">All Promo Codes</h3>
            {loading ? (
              <div className="text-center py-8 text-stone-500 dark:text-slate-400 text-sm">Loading...</div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900/40 rounded-2xl border border-stone-200 dark:border-slate-800 text-stone-500 text-sm">No promo codes yet</div>
            ) : promoCodes.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-amber-600 dark:text-amber-400 text-base tracking-widest">{p.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-stone-100 text-stone-600 border-stone-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-600 dark:text-slate-400">
                    <span><strong className="text-stone-900 dark:text-slate-300">Discount:</strong> {p.discountPercentage}%</span>
                    <span><strong className="text-stone-900 dark:text-slate-300">Max off:</strong> {formatCurrency(p.maxDiscountAmount)}</span>
                    <span><strong className="text-stone-900 dark:text-slate-300">Min order:</strong> {formatCurrency(p.minOrderAmount)}</span>
                    <span><strong className="text-stone-900 dark:text-slate-300">Usage:</strong> {p.usedCount}/{p.usageLimit}</span>
                    <span className="col-span-2"><strong className="text-stone-900 dark:text-slate-300">Expires:</strong> {p.expiryDate ? new Date(p.expiryDate).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <button onClick={() => handleDeletePromo(p.id)} className="p-2 text-stone-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 shrink-0 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
