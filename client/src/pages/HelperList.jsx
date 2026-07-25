import { useEffect, useState } from 'react';
import api from '../api/axios';
import HelperCard from '../components/HelperCard';

const initialFilters = { serviceType: '', city: '', plan: '', minExperience: '', search: '', verifiedOnly: 'true' };

const HelperList = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHelpers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/helpers', { params });
      setHelpers(data.helpers);
    } catch {
      setError('Could not load helpers. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHelpers();
  };

  const update = (field) => (e) => setFilters({ ...filters, [field]: e.target.value });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-semibold text-ink">Find verified help</h1>
      <p className="mt-2 text-ink/60">Filter by service type, city, plan, and experience.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-6 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-ink/60 mb-1">Search</label>
          <input
            placeholder="e.g. cooking, infant care"
            value={filters.search}
            onChange={update('search')}
            className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Service</label>
          <select
            value={filters.serviceType}
            onChange={update('serviceType')}
            className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none bg-white"
          >
            <option value="">Any</option>
            <option value="maid">Maid</option>
            <option value="babysitter">Babysitter</option>
            <option value="nanny">Nanny</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">City</label>
          <input
            value={filters.city}
            onChange={update('city')}
            className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Plan</label>
          <select
            value={filters.plan}
            onChange={update('plan')}
            className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none bg-white"
          >
            <option value="">Any</option>
            <option value="hourly">Hourly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Min. experience</label>
          <input
            type="number"
            min="0"
            value={filters.minExperience}
            onChange={update('minExperience')}
            className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none"
          />
        </div>
        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 font-medium text-white hover:bg-forest-dark transition-colors"
          >
            Search
          </button>
          <label className="flex items-center gap-2 text-sm text-ink/80 whitespace-nowrap">
            <input
              type="checkbox"
              checked={filters.verifiedOnly === 'true'}
              onChange={(e) =>
                setFilters({ ...filters, verifiedOnly: e.target.checked ? 'true' : '' })
              }
            />
            Verified only
          </label>
        </div>
      </form>

      {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="mt-10 text-ink/60">Loading helpers...</p>
      ) : helpers.length === 0 ? (
        <p className="mt-10 text-ink/60">No helpers match these filters yet. Try widening your search.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {helpers.map((helper) => (
            <HelperCard key={helper._id} helper={helper} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HelperList;