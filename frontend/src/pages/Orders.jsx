import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Package, MapPin, ChevronLeft, ChevronRight, Tag, Clock,
  RefreshCw, CheckCircle2, Truck, ChefHat, Sparkles, AlertCircle
} from 'lucide-react';

const statusBadges = {
  PLACED: { label: 'Placed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  READY: { label: 'Ready', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const STEPS = [
  { key: 'PLACED', label: 'Placed', icon: Package },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'PLACED': return 0;
    case 'PREPARING': return 1;
    case 'READY': return 1;
    case 'OUT_FOR_DELIVERY': return 2;
    case 'DELIVERED': return 3;
    default: return -1;
  }
};

const PAGE_SIZE = 5;

const Orders = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pagedData, setPagedData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(location.state?.successMessage || null);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const res = await api.get(
        `/orders/my-orders?page=${page}&size=${PAGE_SIZE}&sortBy=createdAt&sortDir=desc`
      );
      setPagedData(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (!isSilent) {
        setError(err.response?.data?.message || 'Failed to retrieve your orders.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  // Initial load and page change
  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Periodic polling every 6 seconds if there are active (in-progress) orders
  useEffect(() => {
    const orders = pagedData.content || [];
    const hasActiveOrders = orders.some(o =>
      ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
    );

    if (!hasActiveOrders) return;

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [pagedData.content, fetchOrders]);

  // Dismiss banner after 6 seconds
  useEffect(() => {
    if (bannerMessage) {
      const timer = setTimeout(() => setBannerMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [bannerMessage]);

  const orders = pagedData.content || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Success Banner if redirected from checkout */}
      {bannerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5 font-semibold">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs text-emerald-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Order History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track live status and order details
            {pagedData.totalElements > 0 && ` · ${pagedData.totalElements} total orders`}
          </p>
        </div>

        <button
          onClick={() => fetchOrders(false)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
          title="Refresh order status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin text-orange-400' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !refreshing ? (
        <div className="text-center py-16 text-slate-400 text-sm">Fetching your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No orders placed yet</h3>
          <p className="text-slate-500 text-xs mt-1">Your placed orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = statusBadges[order.status] || { label: order.status, color: 'bg-slate-800 text-slate-300' };
            const currentStepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5"
              >
                {/* Top header bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Order ID</span>
                    <h3 className="font-bold text-white text-lg">#{order.id}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-orange-400">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                      {order.discountAmount > 0 && (
                        <p className="text-[10px] text-emerald-400">
                          Saved ${Number(order.discountAmount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper for Normal Workflow */}
                {!isCancelled && currentStepIdx >= 0 && (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                                  : isCurrent
                                  ? 'bg-orange-500 text-white font-bold ring-4 ring-orange-500/20 shadow-md shadow-orange-500/30'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[11px] font-semibold mt-2 ${
                                isCompleted
                                  ? 'text-emerald-400'
                                  : isCurrent
                                  ? 'text-orange-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery details & Partner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>Deliver to:</strong> {order.deliveryAddress}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <Truck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Partner:</strong>{' '}
                      {order.deliveryPartnerName
                        ? `${order.deliveryPartnerName} (#${order.deliveryPartnerId})`
                        : order.status === 'DELIVERED'
                        ? 'Completed'
                        : 'Assigning soon...'}
                    </span>
                  </div>
                </div>

                {/* Promo + Estimated delivery row */}
                <div className="flex flex-wrap gap-4 text-xs">
                  {order.promoCode && (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-bold">{order.promoCode}</span>
                      <span className="text-amber-300">applied</span>
                    </div>
                  )}
                  {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ETA: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Items breakdown */}
                <div className="bg-slate-950/60 rounded-2xl p-4 space-y-2 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Ordered Items
                  </span>
                  {order.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-300">
                      <span>{item.menuItemName} (x{item.quantity})</span>
                      <span className="font-semibold text-slate-200">${Number(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Timestamps */}
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recently'}</span>
                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <span>Updated: {new Date(order.updatedAt).toLocaleString()}</span>
                  )}
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
            disabled={page >= pagedData.totalPages - 1}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Orders;
