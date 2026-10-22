import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/currency';
import { getFoodImage } from '../utils/foodImages';
import VegIndicator from '../components/VegIndicator';
import {
  MapPin, ShoppingBag, ArrowRight, AlertCircle, Tag, X, Check,
  Clock, ShieldCheck, User, Phone
} from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cartItems = cart?.cartItems || cart?.items || [];
  const subtotal = cart?.totalAmount ?? cart?.subtotal ?? 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setApplyingPromo(true);
    try {
      const res = await api.post('/promo-codes/validate', {
        code: promoInput.trim().toUpperCase(),
        orderTotal: subtotal,
      });
      setDiscount(Number(res.data.discountAmount));
      setPromoCode(promoInput.trim().toUpperCase());
      setPromoApplied(true);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid or expired promo code.');
      setPromoApplied(false);
      setDiscount(0);
      setPromoCode('');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoInput('');
    setDiscount(0);
    setPromoApplied(false);
    setPromoError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!deliveryAddress.trim()) {
      setError('Please provide a complete delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/orders/checkout', {
        customerId: user?.id,
        deliveryAddress: deliveryAddress.trim(),
        promoCode: promoApplied ? promoCode : null,
      });
      // Refresh cart state so cart badge & cached state are cleared
      await fetchCart();
      navigate('/orders', {
        state: {
          placedOrderId: res.data?.id,
          successMessage: `Order #${res.data?.id} successfully placed! Preparing fresh in our kitchen.`,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-stone-900 dark:text-white mb-2">No active items to checkout</h2>
        <p className="text-stone-500 dark:text-slate-400 text-xs mb-6">Your cart is currently empty.</p>
        <Link to="/menu" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs shadow-md">
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
          Checkout
        </h1>
        <p className="text-stone-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
          Provide your delivery details to confirm and dispatch your order
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8">
        
        {/* Delivery Address & Customer Details */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm dark:shadow-xl">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>Delivery Destination</span>
          </h3>

          {/* Customer Info Card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-slate-200">
              <User className="w-3.5 h-3.5 text-orange-500" />
              <span>Ordering for: {user?.name || user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Contact: {user.phone}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Full Delivery Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Flat/House No., Building Name, Street, Area, Landmark (e.g., Near Metro Station)..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl p-3.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 text-xs sm:text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Promo Code Section */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Apply Coupon</span>
            </label>

            {promoApplied ? (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold">
                  <Check className="w-4 h-4" />
                  <span>{promoCode}</span>
                  <span className="font-normal text-emerald-600 dark:text-emerald-300">
                    — Saving {formatCurrency(discount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-stone-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g., WELCOME20)..."
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                  className="flex-1 bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-amber-500 rounded-2xl px-3.5 py-2.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 text-xs sm:text-sm outline-none transition-all uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={applyingPromo || !promoInput.trim()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-2xl disabled:opacity-50 transition-all whitespace-nowrap cursor-pointer shadow-sm"
                >
                  {applyingPromo ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {promoError}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span><strong>Estimated Delivery:</strong> ~30–45 mins. A delivery partner is assigned automatically when the kitchen finishes packing.</span>
          </div>
        </div>

        {/* Order Items Review & Bill Breakdown */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm dark:shadow-xl h-fit">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-3">
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            <span>Order Summary</span>
          </h3>

          {/* Items review */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const name = item.name || item.menuItemName;
              const imgUrl = getFoodImage({ name, imageUrl: item.imageUrl, categoryName: item.categoryName });
              const itemTotal = Number(item.subTotal ?? item.subtotal ?? (item.price * item.quantity)) || 0;

              return (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={imgUrl}
                      alt={name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-slate-800"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                    <div className="truncate">
                      <p className="font-bold text-stone-900 dark:text-slate-200 truncate">{name}</p>
                      <p className="text-[10px] text-stone-500 dark:text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-stone-900 dark:text-slate-100 shrink-0">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing calculations in INR */}
          <div className="border-t border-stone-200 dark:border-slate-800 pt-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-stone-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-stone-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Promo Discount ({promoCode})</span>
                <span className="font-bold">− {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600 dark:text-slate-400">
              <span>Delivery Partner Fee</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-slate-800">
              <span>Total Payable</span>
              <span className="text-orange-600 dark:text-orange-400">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Placing Order...' : `Place Order • ${formatCurrency(finalTotal)}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};

export default Checkout;
