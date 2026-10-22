import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Truck, MapPin, CheckCircle, Package, RefreshCw, Phone, User, Clock, CheckCircle2 } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/delivery-partners/me/orders');
      setAssignedOrders(res.data);
    } catch (err) {
      console.error('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/orders/${orderId}/delivery-status?status=${newStatus}`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Delivery Partner Portal</h1>
            <p className="text-slate-400 text-sm">View assigned deliveries and update order dispatch status</p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh Deliveries"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {loading && assignedOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Loading assigned deliveries...</div>
      ) : assignedOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No active delivery assignments</h3>
          <p className="text-slate-500 text-xs mt-1">You will be notified when a new order is assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignedOrders.map((ord) => {
            const isProcessing = updatingOrderId === ord.id;
            return (
              <div key={ord.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Order ID</span>
                    <h3 className="font-bold text-white text-lg">#{ord.id}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : ord.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {ord.status}
                    </span>
                    <span className="text-sm font-extrabold text-orange-400">${Number(ord.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer Delivery Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm space-y-2">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      {ord.customerName || `Customer #${ord.customerId}`}
                    </span>
                    {ord.customerPhone && (
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {ord.customerPhone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-slate-400 text-xs pt-1">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>Address:</strong> {ord.deliveryAddress}</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Package Contents</span>
                  {ord.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-300">
                      <span>{item.menuItemName}</span>
                      <span className="font-semibold text-slate-400">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Partner Status Actions with proper state transitions */}
                <div className="pt-2 flex flex-wrap items-center gap-3 justify-end">
                  {(ord.status === 'PREPARING' || ord.status === 'READY') && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{isProcessing ? 'Updating...' : 'Mark Out For Delivery'}</span>
                    </button>
                  )}

                  {ord.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{isProcessing ? 'Updating...' : 'Mark as Delivered'}</span>
                    </button>
                  )}

                  {ord.status === 'DELIVERED' && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 py-1">
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
