import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn, Mail, Lock, AlertCircle, ArrowRight,
  UtensilsCrossed, Shield, Truck
} from 'lucide-react';

const ROLES = [
  {
    id: 'CUSTOMER',
    label: 'Customer',
    description: 'Browse menu, cart & track orders',
    icon: UtensilsCrossed,
    activeClasses:
      'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/15 dark:border-orange-500/60 dark:text-orange-300 shadow-sm',
    inactiveClasses:
      'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 dark:bg-slate-800/60 dark:border-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300',
  },
  {
    id: 'ADMIN',
    label: 'Admin',
    description: 'Manage menu & dispatch partners',
    icon: Shield,
    activeClasses:
      'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-500/15 dark:border-purple-500/60 dark:text-purple-300 shadow-sm',
    inactiveClasses:
      'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 dark:bg-slate-800/60 dark:border-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300',
  },
  {
    id: 'DELIVERY_PARTNER',
    label: 'Delivery Partner',
    description: 'View orders & update delivery status',
    icon: Truck,
    activeClasses:
      'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/60 dark:text-emerald-300 shadow-sm',
    inactiveClasses:
      'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 dark:bg-slate-800/60 dark:border-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300',
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

    const actualRole = result.role;

    if (actualRole !== selectedRole) {
      const roleLabel = ROLES.find((r) => r.id === selectedRole)?.label ?? selectedRole;
      const actualLabel = ROLES.find((r) => r.id === actualRole)?.label ?? actualRole;
      logout();
      setError(
        `This account is registered as "${actualLabel}", not "${roleLabel}". ` +
        `Please select the correct role and try again.`
      );
      return;
    }

    const from = location.state?.from?.pathname;
    navigate(from ?? ROLE_DESTINATIONS[actualRole] ?? '/', { replace: true });
  };

  const activeRoleCfg = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors">

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/30 text-white">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-0.5">Sign in to your FlavorsExpress account</p>
        </div>

        {/* Role Selector */}
        <div className="mb-5">
          <span className="block text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Select Account Role
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ id, label, icon: Icon, activeClasses, inactiveClasses }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setSelectedRole(id); setError(''); }}
                className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedRole === id ? activeClasses : inactiveClasses
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold leading-tight">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-stone-500 dark:text-slate-500 text-center">
            {activeRoleCfg?.description}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Signing in…' : (
              <>
                <span>Sign In as {activeRoleCfg?.label}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 dark:border-slate-800 text-center space-y-1.5">
          <p className="text-xs text-stone-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 dark:text-orange-400 hover:underline">
              Register as Customer
            </Link>
          </p>
          <p className="text-[10px] text-stone-400 dark:text-slate-500">
            Delivery partner & admin accounts are provisioned by an administrator.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
