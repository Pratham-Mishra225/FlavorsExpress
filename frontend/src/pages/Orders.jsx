import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/currency';
import { getFoodImage } from '../utils/foodImages';
import {
  Package, MapPin, ChevronLeft, ChevronRight, Tag, Clock,
  RefreshCw, CheckCircle2, Truck, ChefHat, Sparkles, AlertCircle, User, Phone
} from 'lucide-react';

const statusBadges = {
  PLACED: { label: 'Placed', color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' },
  READY: { label: 'Ready', color: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' },
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

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Periodic polling every 6 seconds for active orders
  useEffect(() => {
    const ordersList = pagedData.content || [];
    const hasActiveOrders = ordersList.some(o =>
      ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
    );

    if (!hasActiveOrders) return;

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [pagedData.content, fetchOrders]);

  useEffect(() => {
    if (bannerMessage) {
      const timer = setTimeout(() => setBannerMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [bannerMessage]);

  const orders = pagedData.content || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* Banner on successful checkout */}
      {bannerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-stone-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time status tracking from kitchen to your doorstep
          </p>
        </div>

        <button
          onClick={() => fetchOrders(false)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          title="Refresh order status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin text-orange-500' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !refreshing ? (
        <div className="text-center py-20 text-stone-500 dark:text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
          <span>Fetching your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <Package className="w-12 h-12 text-stone-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-black text-stone-800 dark:text-slate-200">No orders placed yet</h3>
          <p className="text-stone-500 dark:text-slate-400 text-xs mt-1">
            Once you order from our menu, your live deliveries will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = statusBadges[order.status] || { label: order.status, color: 'bg-stone-100 text-stone-700' };
            const currentStepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Order ID</span>
                    <h3 className="font-black text-stone-900 dark:text-white text-lg">#{order.id}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    <div className="text-right">
                      <span className="text-base font-black text-orange-600 dark:text-orange-400">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      {order.discountAmount > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Saved {formatCurrency(order.discountAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                {!isCancelled && currentStepIdx >= 0 && (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center relative">
                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                              <div
                                className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                                  idx < currentStepIdx
                                    ? 'bg-orange-500'
                                    : 'bg-stone-200 dark:bg-slate-800'
                                }`}
                              />
                            )}

                            {/* Step Icon circle */}
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center z-10 transition-all ${
                                isCompleted
                                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                                  : isCurrent
                                  ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-lg animate-pulse'
                                  : 'bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-slate-500 border border-stone-200 dark:border-slate-700'
                              }`}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            <span
                              className={`text-[11px] font-bold mt-2 ${
                                isCurrent
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : isCompleted
                                  ? 'text-stone-800 dark:text-slate-200'
                                  : 'text-stone-400 dark:text-slate-600'
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

                {/* Delivery & Partner Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 dark:bg-slate-950 p-4 rounded-2xl border border-stone-200 dark:border-slate-800/80">
                  <div className="flex items-start gap-2 text-stone-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900 dark:text-white">Delivery to:</strong>{' '}
                      {order.deliveryAddress || 'Address on file'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-stone-600 dark:text-slate-300">
                    <Truck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900 dark:text-white">Partner:</strong>{' '}
                      {order.deliveryPartnerName
                        ? `${order.deliveryPartnerName} (#${order.deliveryPartnerId})`
                        : order.status === 'DELIVERED'
                        ? 'Delivery Completed'
                        : 'Assigning nearest partner...'}
                    </span>
                  </div>
                </div>

                {/* Coupons & ETA Tags */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {order.promoCode && (
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-xl font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{order.promoCode} applied</span>
                    </div>
                  )}
                  {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 px-3 py-1 rounded-xl font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ETA: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Ordered Items Breakdown */}
                <div className="bg-stone-50 dark:bg-slate-950/60 rounded-2xl p-4 space-y-2 border border-stone-200 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Ordered Dishes
                  </span>
                  {order.orderItems?.map((item) => {
                    const imgUrl = getFoodImage({ name: item.menuItemName });
                    return (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <img
                            src={imgUrl}
                            alt={item.menuItemName}
                            className="w-7 h-7 rounded-md object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="font-semibold text-stone-800 dark:text-slate-200">
                            {item.menuItemName} <span className="text-stone-500 dark:text-slate-400">×{item.quantity}</span>
                          </span>
                        </div>
                        <span className="font-extrabold text-stone-900 dark:text-slate-100">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Timestamps */}
                <div className="flex justify-between text-[11px] text-stone-400 dark:text-slate-500">
                  <span>Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recently'}</span>
                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <span>Last updated: {new Date(order.updatedAt).toLocaleTimeString()}</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagedData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
            disabled={page >= pagedData.totalPages - 1}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Orders;
