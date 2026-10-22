import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn, Mail, Lock, AlertCircle, ArrowRight,
  UtensilsCrossed, Shield, Truck,
} from 'lucide-react';

// Maps frontend role strings (matching backend UserRole enum) to UI config
const ROLES = [
  {
    id: 'CUSTOMER',
    label: 'Customer',
    description: 'Browse menu, manage cart & track orders',
    icon: UtensilsCrossed,
    accent: 'orange',
    activeClasses:
      'bg-orange-500/15 border-orange-500/60 text-orange-300 shadow-[0_0_0_1px_rgba(249,115,22,0.3)]',
    inactiveClasses:
      'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300',
  },
  {
    id: 'ADMIN',
    label: 'Admin',
    description: 'Manage menu, orders & delivery partners',
    icon: Shield,
    accent: 'purple',
    activeClasses:
      'bg-purple-500/15 border-purple-500/60 text-purple-300 shadow-[0_0_0_1px_rgba(168,85,247,0.3)]',
    inactiveClasses:
      'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300',
  },
  {
    id: 'DELIVERY_PARTNER',
    label: 'Delivery Partner',
    description: 'View assigned orders & update status',
    icon: Truck,
    accent: 'emerald',
    activeClasses:
      'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]',
    inactiveClasses:
      'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300',
  },
];

const ROLE_DESTINATIONS = {
  CUSTOMER: '/menu',
  ADMIN: '/admin',
  DELIVERY_PARTNER: '/delivery',
};

const Login = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // --- Role-match validation ---
    // The backend always returns the actual role from the database.
    // If the user selected a role that doesn't match their account, reject them.
    const actualRole = result.role; // e.g. "CUSTOMER", "ADMIN", "DELIVERY_PARTNER"

    if (actualRole !== selectedRole) {
      // Log the mismatch, clear auth state, and surface a helpful error.
      const roleLabel = ROLES.find((r) => r.id === selectedRole)?.label ?? selectedRole;
      const actualLabel = ROLES.find((r) => r.id === actualRole)?.label ?? actualRole;
      logout(); // clear tokens so no stale auth remains
      setError(
        `This account is registered as "${actualLabel}", not "${roleLabel}". ` +
        `Please select the correct role and try again.`
      );
      return;
    }

    // Navigate: honour the original intended URL first, then fall back to role dashboard
    const from = location.state?.from?.pathname;
    navigate(from ?? ROLE_DESTINATIONS[actualRole] ?? '/', { replace: true });
  };

  const activeRoleCfg = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-orange-500/5 relative overflow-hidden">

        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Select your role and sign in</p>
        </div>

        {/* ── Role Selector ── */}
        <div className="mb-6">
          <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Sign in as
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ id, label, description, icon: Icon, activeClasses, inactiveClasses }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setSelectedRole(id); setError(''); }}
                className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-200 ${
                  selectedRole === id ? activeClasses : inactiveClasses
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold leading-tight">{label}</span>
                <span className="text-[9px] leading-tight text-current opacity-70 hidden sm:block">
                  {description}
                </span>
              </button>
            ))}
          </div>
          {/* Selected role caption for extra clarity */}
          <p className="mt-2 text-[11px] text-slate-500 text-center">
            {activeRoleCfg?.description}
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Credentials Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Authenticating…' : (
              <>
                <span>Sign In as {activeRoleCfg?.label}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Create a customer account
            </Link>
          </p>
          <p className="text-[11px] text-slate-600">
            Admin and Delivery Partner accounts are provisioned by a system administrator.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
