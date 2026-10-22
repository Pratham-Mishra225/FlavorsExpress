import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/currency';
import {
  Truck, MapPin, CheckCircle, Package, RefreshCw, Phone, User,
  Clock, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, ShieldAlert
} from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/delivery-partners/me'),
        api.get('/delivery-partners/me/orders'),
      ]);
      setProfile(pRes.data);
      setAssignedOrders(oRes.data);
    } catch (err) {
      console.error('Failed to load delivery data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/orders/${orderId}/delivery-status?status=${newStatus}`);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleAvailability = async (targetStatus) => {
    setUpdatingStatus(true);
    setStatusMsg({ text: '', type: '' });
    try {
      const res = await api.put(`/delivery-partners/me/status?status=${targetStatus}`);
      setProfile(res.data);
      setStatusMsg({ text: `Availability set to ${targetStatus}`, type: 'success' });
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Failed to update availability status',
        type: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const hasActiveDelivery = assignedOrders.some(
    o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  const currentPartnerStatus = profile?.status || 'AVAILABLE';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Delivery Partner Portal
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              Manage availability &amp; dispatch assigned customer orders
            </p>
          </div>
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer w-fit shadow-sm"
          title="Refresh Deliveries"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Partner Status & Availability Controls Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Current Working Status
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                currentPartnerStatus === 'AVAILABLE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  : currentPartnerStatus === 'BUSY'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                  : 'bg-stone-100 text-stone-600 border-stone-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}>
                {currentPartnerStatus}
              </span>
              <span className="text-xs text-stone-600 dark:text-slate-400">
                {currentPartnerStatus === 'AVAILABLE' && 'Ready for auto and manual dispatch'}
                {currentPartnerStatus === 'BUSY' && 'Currently delivering active order'}
                {currentPartnerStatus === 'OFFLINE' && 'Not accepting deliveries'}
              </span>
            </div>
          </div>

          {/* Availability Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAvailability('AVAILABLE')}
              disabled={updatingStatus || hasActiveDelivery || currentPartnerStatus === 'AVAILABLE'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPartnerStatus === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Go Available
            </button>
            <button
              onClick={() => handleToggleAvailability('OFFLINE')}
              disabled={updatingStatus || hasActiveDelivery || currentPartnerStatus === 'OFFLINE'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPartnerStatus === 'OFFLINE'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Go Offline
            </button>
          </div>
        </div>

        {hasActiveDelivery && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Active delivery in progress. Status is locked to BUSY until the order is delivered.</span>
          </div>
        )}

        {statusMsg.text && (
          <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Orders List */}
      {loading && assignedOrders.length === 0 ? (
        <div className="text-center py-20 text-stone-500 dark:text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
          <span>Loading assigned deliveries...</span>
        </div>
      ) : assignedOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <Package className="w-12 h-12 text-stone-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-black text-stone-800 dark:text-slate-200">No active delivery assignments</h3>
          <p className="text-stone-500 dark:text-slate-400 text-xs mt-1">
            Keep your status set to <strong>AVAILABLE</strong> to receive incoming orders automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {assignedOrders.map((ord) => {
            const isProcessing = updatingOrderId === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Order ID</span>
                    <h3 className="font-black text-stone-900 dark:text-white text-lg">#{ord.id}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                        : ord.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30'
                        : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                    }`}>
                      {ord.status}
                    </span>
                    <span className="text-base font-black text-orange-600 dark:text-orange-400">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Customer Delivery Details */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center justify-between text-xs border-b border-stone-200 dark:border-slate-800/80 pb-2">
                    <span className="flex items-center gap-1.5 text-stone-800 dark:text-slate-300 font-bold">
                      <User className="w-3.5 h-3.5 text-orange-500" />
                      {ord.customerName || `Customer #${ord.customerId}`}
                    </span>
                    {ord.customerPhone && (
                      <span className="flex items-center gap-1.5 text-stone-800 dark:text-slate-300 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {ord.customerPhone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-stone-600 dark:text-slate-400 text-xs pt-1">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span><strong className="text-stone-900 dark:text-white">Delivery Address:</strong> {ord.deliveryAddress}</span>
                  </div>
                </div>

                {/* Package Items */}
                <div className="bg-stone-50 dark:bg-slate-950/60 rounded-2xl p-3.5 border border-stone-200 dark:border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Package Contents</span>
                  {ord.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-stone-700 dark:text-slate-300">
                      <span>{item.menuItemName}</span>
                      <span className="font-bold text-stone-900 dark:text-slate-200">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3 justify-end">
                  {(ord.status === 'PREPARING' || ord.status === 'READY') && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(ord.id, 'OUT_FOR_DELIVERY')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{isProcessing ? 'Updating...' : 'Mark Out For Delivery'}</span>
                    </button>
                  )}

                  {ord.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(ord.id, 'DELIVERED')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{isProcessing ? 'Updating...' : 'Mark as Delivered'}</span>
                    </button>
                  )}

                  {ord.status === 'DELIVERED' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Delivery completed successfully
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default DeliveryDashboard;
