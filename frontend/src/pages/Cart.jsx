import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

const Cart = () => {
  const { cart, loading, error, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const cartItems = cart?.cartItems || [];
  const totalAmount = cart?.totalAmount ?? cart?.subtotal ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Food Cart</h1>
          <p className="text-slate-400 text-sm mt-1">Review your selected items before checkout</p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading cart details...</div>
      ) : error ? (
        <div className="text-center py-20 bg-rose-950/20 border border-rose-800/80 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-rose-900/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-rose-300 mb-2">Unable to retrieve cart</h3>
          <p className="text-rose-400 text-sm max-w-sm mx-auto mb-6">{error}</p>
          <button
            onClick={fetchCart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your cart is currently empty</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Looks like you haven't added any tasty meals to your cart yet.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Menu</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-base">{item.menuItemName}</h4>
                  <p className="text-xs text-amber-400 font-semibold">
                    ${Number(item.price).toFixed(2)} each
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.menuItemId, item.quantity - 1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.menuItemId, item.quantity + 1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-slate-100 min-w-[60px] text-right">
                    ${(Number(item.subTotal ?? (item.price * item.quantity)) || 0).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Side Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 h-fit space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-200">${Number(totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-orange-400">${Number(totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
