import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  household: '/dashboard',
  helper: '/helper/dashboard',
  admin: '/admin',
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from || roleHome[user.role] || '/';
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 text-ink/60">Log in to manage bookings and your profile.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-ink/80">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-forest py-3 font-medium text-white hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New here?{' '}
        <Link to="/register" className="font-medium text-forest hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl bg-clay/60 p-4 text-xs text-ink/60">
        <p className="font-semibold text-ink/80 mb-1">Demo accounts (after running the seed script)</p>
        <p>Admin: admin@example.com / Admin@123</p>
        <p>Household: household@example.com / Household@123</p>
        <p>Helper: sunita.maid@example.com / Helper@123</p>
      </div>
    </div>
  );
};

export default Login;
