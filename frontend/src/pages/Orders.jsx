import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Package, MapPin, ChevronLeft, ChevronRight, Tag, Clock } from 'lucide-react';

const statusBadges = {
  PLACED: { label: 'Placed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  READY: { label: 'Ready', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const PAGE_SIZE = 5;

const Orders = () => {
  const { user } = useAuth();
  const [pagedData, setPagedData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/orders/my-orders?page=${page}&size=${PAGE_SIZE}&sortBy=createdAt&sortDir=desc`
      );
      setPagedData(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const orders = pagedData.content || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Order History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track live status and order details
            {pagedData.totalElements > 0 && ` · ${pagedData.totalElements} total orders`}
          </p>
        </div>
      </div>

      {loading ? (
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
            return (
              <div
                key={order.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
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

                {/* Delivery address */}
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span><strong>Deliver to:</strong> {order.deliveryAddress}</span>
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
