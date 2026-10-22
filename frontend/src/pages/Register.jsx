import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/menu');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/30 text-white">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Create Customer Account</h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-0.5">Order authentic Indian delicacies &amp; track deliveries</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                required
                placeholder="Rohan Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="rohan@example.com"
                value={formData.email}
                onChange={handleChange}
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
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-stone-50 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2.5 text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Registering Account...' : (
              <>
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 dark:border-slate-800 text-center space-y-1">
          <p className="text-xs text-stone-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 dark:text-orange-400 hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-[10px] text-stone-400 dark:text-slate-500">
            Admin &amp; Delivery Partner accounts are provisioned by an administrator.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
