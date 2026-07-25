import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [pendingHelpers, setPendingHelpers] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, p, u, b] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/helpers/pending'),
        api.get('/admin/users'),
        api.get('/admin/bookings'),
      ]);
      setAnalytics(a.data);
      setPendingHelpers(p.data.helpers);
      setUsers(u.data.users);
      setBookings(b.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const verify = async (id, status) => {
    const rejectionReason = status === 'rejected' ? window.prompt('Reason for rejection?') || '' : undefined;
    await api.patch(`/admin/helpers/${id}/verify`, { status, rejectionReason });
    loadAll();
  };

  const toggleUser = async (id, isActive) => {
    await api.patch(`/admin/users/${id}/status`, { isActive: !isActive });
    loadAll();
  };

  const kpis = analytics && [
    { label: 'Registered households', value: analytics.registeredHouseholds },
    { label: 'Verified helpers', value: `${analytics.verifiedHelpers} / ${analytics.totalHelpers}` },
    { label: 'Booking completion rate', value: `${analytics.bookingCompletionRate}%` },
    { label: 'Avg. satisfaction', value: `★ ${analytics.averageCustomerSatisfaction || '—'}` },
    { label: 'Total bookings', value: analytics.totalBookings },
    { label: 'Cancelled bookings', value: analytics.cancelledBookings },
  ];

  if (loading) return <p className="mx-auto max-w-6xl px-5 py-16 text-ink/60">Loading admin dashboard...</p>;
  if (error) return <p className="mx-auto max-w-6xl px-5 py-16 text-red-700">{error}</p>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-semibold text-ink">Admin dashboard</h1>

      <div className="mt-6 flex gap-2 border-b border-clay">
        {['analytics', 'verification', 'users', 'bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 ${
              tab === t ? 'border-forest text-forest' : 'border-transparent text-ink/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'analytics' && (
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-clay p-5">
              <p className="text-sm text-ink/60">{k.label}</p>
              <p className="mt-1 text-2xl font-display font-semibold text-forest">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'verification' && (
        <div className="mt-6 space-y-4">
          {pendingHelpers.length === 0 ? (
            <p className="text-ink/60">No pending verifications. Nice and caught up.</p>
          ) : (
            pendingHelpers.map((h) => (
              <div key={h._id} className="rounded-2xl border border-clay p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">
                      {h.user?.name} &middot; <span className="capitalize">{h.serviceType}</span>
                    </p>
                    <p className="text-sm text-ink/60">{h.user?.email} &middot; {h.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => verify(h._id, 'approved')}
                      className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-dark"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => verify(h._id, 'rejected')}
                      className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {(h.verification?.documents || []).map((doc, i) => (
                    <a
                      key={i}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-forest hover:underline"
                    >
                      {doc.docType} &rarr;
                    </a>
                  ))}
                  {(!h.verification?.documents || h.verification.documents.length === 0) && (
                    <p className="text-sm text-ink/50">No documents submitted yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/50 border-b border-clay">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-clay/60">
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4 capitalize">{u.role}</td>
                  <td className="py-2 pr-4">{u.isActive ? 'Active' : 'Disabled'}</td>
                  <td className="py-2 pr-4">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleUser(u._id, u.isActive)}
                        className="text-forest hover:underline"
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="rounded-xl border border-clay p-4 text-sm flex flex-wrap justify-between gap-2">
              <span>
                {b.household?.name} &rarr; {b.helper?.user?.name} &middot; {b.servicePlan} &middot; ₹{b.price}
              </span>
              <span className="capitalize font-medium text-ink/70">{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;