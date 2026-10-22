import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getFoodImage } from '../utils/foodImages';
import VegIndicator from '../components/VegIndicator';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
  RefreshCw, ShieldCheck, Sparkles
} from 'lucide-react';

const Cart = () => {
  const { cart, loading, error, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const cartItems = cart?.cartItems || cart?.items || [];
  const totalAmount = cart?.totalAmount ?? cart?.subtotal ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            Your Food Cart
          </h1>
          <p className="text-stone-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Review your Indian fast-food selections before checkout
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-500 dark:text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
          <span>Updating your cart...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/80 rounded-3xl p-8 shadow-md">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300 mb-1">Unable to retrieve cart</h3>
          <p className="text-rose-600 dark:text-rose-400 text-xs max-w-sm mx-auto mb-5">{error}</p>
          <button
            onClick={fetchCart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-xl space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-stone-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-stone-400 dark:text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-stone-900 dark:text-white">Your cart is empty</h3>
          <p className="text-stone-500 dark:text-slate-400 text-xs leading-relaxed">
            You haven't added any fresh Indian delicacies yet. Explore our Mumbai street-food favorites, burgers, and biryanis!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Menu</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3.5">
            {cartItems.map((item) => {
              const name = item.name || item.menuItemName || 'Menu Item';
              const imgUrl = getFoodImage({ name, imageUrl: item.imageUrl, categoryName: item.categoryName });
              const itemTotal = Number(item.subTotal ?? item.subtotal ?? (item.price * item.quantity)) || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
                >
                  {/* Left: Thumbnail & Name */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={imgUrl}
                      alt={name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-slate-800"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <VegIndicator isVegetarian={item.isVegetarian ?? true} size="sm" />
                        <h4 className="font-extrabold text-stone-900 dark:text-slate-100 text-sm sm:text-base">
                          {name}
                        </h4>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>

                  {/* Right: Stepper, subtotal, remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-slate-800">
                    {/* Stepper */}
                    <div className="flex items-center bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl p-0.5">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeFromCart(item.id);
                          } else {
                            updateQuantity(item.id, item.menuItemId, item.quantity - 1);
                          }
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-stone-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.menuItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal in INR */}
                    <span className="text-sm font-black text-stone-900 dark:text-slate-100 min-w-[70px] text-right">
                      {formatCurrency(itemTotal)}
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 h-fit space-y-5 shadow-md dark:shadow-xl">
            <h3 className="text-base font-black text-stone-900 dark:text-white border-b border-stone-200 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>Bill Summary</span>
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-bold text-stone-800 dark:text-slate-200">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-slate-400">
                <span>Delivery Partner Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-slate-400">
                <span>Restaurant Packaging</span>
                <span className="font-bold text-stone-700 dark:text-slate-300">Complimentary</span>
              </div>
              <div className="border-t border-stone-200 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-stone-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-orange-600 dark:text-orange-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-800 dark:text-orange-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-orange-500" />
              <span>Have a promo code? Apply <strong>WELCOME20</strong> on the next step for 20% off!</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;
