import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  household: '/dashboard',
  helper: '/helper/dashboard',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('household');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    serviceType: 'maid',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
        address: role === 'household' ? { city: form.city } : undefined,
        city: role === 'helper' ? form.city : undefined,
        serviceType: role === 'helper' ? form.serviceType : undefined,
      };
      const user = await register(payload);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold text-ink">Create your account</h1>
      <p className="mt-2 text-ink/60">Join as a household looking for help, or as a helper.</p>

      <div className="mt-6 flex rounded-full bg-clay p-1 text-sm font-medium">
        {['household', 'helper'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-full py-2 transition-colors ${
              role === r ? 'bg-forest text-white' : 'text-ink/60'
            }`}
          >
            {r === 'household' ? 'I need help' : "I'm a helper"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-ink/80">Full name</label>
          <input
            required
            value={form.name}
            onChange={update('name')}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">Phone</label>
          <input
            value={form.phone}
            onChange={update('phone')}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">City</label>
          <input
            required
            value={form.city}
            onChange={update('city')}
            className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
          />
        </div>

        {role === 'helper' && (
          <div>
            <label className="block text-sm font-medium text-ink/80">Service type</label>
            <select
              value={form.serviceType}
              onChange={update('serviceType')}
              className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none bg-white"
            >
              <option value="maid">Maid</option>
              <option value="babysitter">Babysitter</option>
              <option value="nanny">Nanny</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-forest py-3 font-medium text-white hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-forest hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
