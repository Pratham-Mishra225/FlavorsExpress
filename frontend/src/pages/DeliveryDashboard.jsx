import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Truck, MapPin, CheckCircle, Package, RefreshCw, AlertCircle } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders in OUT_FOR_DELIVERY, PREPARING, READY
      const resPrep = await api.get('/orders/status/PREPARING');
      const resReady = await api.get('/orders/status/READY');
      const resOut = await api.get('/orders/status/OUT_FOR_DELIVERY');
      const combined = [...resPrep.data, ...resReady.data, ...resOut.data];
      
      // Filter for orders where deliveryPartnerId matches the delivery partner's ID or show active orders
      const myOrders = combined.filter((ord) => ord.deliveryPartnerId !== null);
      setAssignedOrders(myOrders);
    } catch (err) {
      console.error('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, partnerId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/delivery-partner/${partnerId}/status?status=${newStatus}`);
      alert(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
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
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Deliveries"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading assigned deliveries...</div>
      ) : assignedOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No active delivery assignments</h3>
          <p className="text-slate-500 text-xs mt-1">You will be notified when a new order is assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignedOrders.map((ord) => (
            <div key={ord.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Order ID</span>
                  <h3 className="font-bold text-white text-lg">#{ord.id}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {ord.status}
                  </span>
                  <span className="text-sm font-extrabold text-orange-400">${Number(ord.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm space-y-1">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Customer Delivery Address</span>
                </div>
                <p className="text-slate-400 pl-6 text-xs">{ord.deliveryAddress}</p>
              </div>

              {/* Items Summary */}
              <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Package Contents</span>
                {ord.orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-slate-300">
                    <span>{item.menuItemName}</span>
                    <span className="font-semibold text-slate-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Partner Status Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3 justify-end">
                {ord.status !== 'OUT_FOR_DELIVERY' && ord.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleUpdateStatus(ord.id, ord.deliveryPartnerId, 'OUT_FOR_DELIVERY')}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Mark Out For Delivery</span>
                  </button>
                )}

                {ord.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleUpdateStatus(ord.id, ord.deliveryPartnerId, 'DELIVERED')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Delivered</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DeliveryDashboard;
