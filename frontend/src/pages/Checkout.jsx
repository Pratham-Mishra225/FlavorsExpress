import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { MapPin, ShoppingBag, ArrowRight, AlertCircle, Tag, X, Check, Clock } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
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

  const cartItems = cart?.cartItems || [];
  const subtotal = cart?.totalAmount || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setApplyingPromo(true);
    try {
      const res = await api.post('/promo-codes/validate', {
        code: promoInput.trim(),
        orderTotal: subtotal,
      });
      setDiscount(Number(res.data.discountAmount));
      setPromoCode(promoInput.trim());
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
      setError('Please provide a valid delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/orders/checkout', {
        customerId: user.id,
        deliveryAddress: deliveryAddress.trim(),
        promoCode: promoApplied ? promoCode : null,
      });
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">No active items to checkout</h2>
        <p className="text-slate-400 text-sm mb-6">Your cart is empty.</p>
        <Link to="/menu" className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm">
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white">Checkout</h1>
        <p className="text-slate-400 text-sm mt-1">Provide delivery details to complete your order</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Delivery Address Form */}
        <div className="md:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-5 h-5 text-orange-500" />
            Delivery Destination
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Delivery Address
            </label>
            <textarea
              rows={4}
              required
              placeholder="House/Apartment #, Street Address, Area, Landmark..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Promo Code Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Promo Code
            </label>

            {promoApplied ? (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <Check className="w-4 h-4" />
                  <span>{promoCode}</span>
                  <span className="text-emerald-300 font-normal">— Saving ${Number(discount).toFixed(2)}</span>
                </div>
                <button type="button" onClick={handleRemovePromo} className="text-slate-400 hover:text-rose-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code..."
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                  className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={applyingPromo || !promoInput.trim()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-xl disabled:opacity-50 transition-all whitespace-nowrap"
                >
                  {applyingPromo ? '...' : 'Apply'}
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-rose-400 text-xs mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {promoError}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Estimated delivery:</strong> ~30–45 minutes. A delivery partner will be automatically assigned once your order is prepared.</span>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Order Summary
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-slate-300">
                <span className="truncate max-w-[140px] font-medium">{item.menuItemName} (x{item.quantity})</span>
                <span className="font-bold text-slate-100">${Number(item.subTotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>${Number(subtotal).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Promo Discount</span>
                <span>− ${Number(discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Payable</span>
              <span className="text-orange-400">${Number(finalTotal).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : (
              <>
                <span>Confirm &amp; Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default Checkout;
