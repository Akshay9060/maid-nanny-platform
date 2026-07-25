import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusColors = {
  pending: 'bg-marigold/20 text-marigold-dark',
  accepted: 'bg-forest/10 text-forest',
  active: 'bg-forest/10 text-forest',
  completed: 'bg-clay text-ink/60',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-red-50 text-red-700',
};

const HelperDashboard = () => {
  const [tab, setTab] = useState('jobs');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [docForm, setDocForm] = useState({ docType: 'Government ID', fileUrl: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        api.get('/helpers/me/profile'),
        api.get('/bookings/assigned'),
      ]);
      setProfile(profileRes.data.helper);
      setBookings(bookingsRes.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateProfileField = (field, value) => setProfile((p) => ({ ...p, [field]: value }));
  const updatePricing = (plan, value) =>
    setProfile((p) => ({ ...p, pricing: { ...p.pricing, [plan]: value === '' ? null : Number(value) } }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus('');
    try {
      const { bio, skills, experienceYears, city, availability, pricing, isAvailableForBooking } = profile;
      const { data } = await api.put('/helpers/me/profile', {
        bio,
        skills,
        experienceYears: Number(experienceYears) || 0,
        city,
        availability,
        pricing,
        isAvailableForBooking,
      });
      setProfile(data.helper);
      setSaveStatus('Profile updated.');
    } catch (err) {
      setSaveStatus(err.response?.data?.message || 'Could not save profile.');
    }
  };

  const submitDocument = async (e) => {
    e.preventDefault();
    if (!docForm.fileUrl) return;
    try {
      const { data } = await api.post('/helpers/me/documents', docForm);
      setProfile(data.helper);
      setDocForm({ docType: 'Government ID', fileUrl: '' });
    } catch (err) {
      setSaveStatus(err.response?.data?.message || 'Document upload failed.');
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      load();
    } catch (err) {
      setSaveStatus(err.response?.data?.message || 'Could not update booking.');
    }
  };

  if (loading) return <p className="mx-auto max-w-5xl px-5 py-16 text-ink/60">Loading...</p>;
  if (error) return <p className="mx-auto max-w-5xl px-5 py-16 text-red-700">{error}</p>;
  if (!profile) return <p className="mx-auto max-w-5xl px-5 py-16 text-red-700">No profile found.</p>;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-semibold text-ink">Helper dashboard</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            profile.verification.status === 'approved'
              ? 'bg-forest/10 text-forest'
              : profile.verification.status === 'rejected'
              ? 'bg-red-50 text-red-700'
              : 'bg-marigold/20 text-marigold-dark'
          }`}
        >
          Verification: {profile.verification.status}
        </span>
      </div>

      <div className="mt-6 flex gap-2 border-b border-clay">
        {['jobs', 'profile', 'documents', 'earnings'].map((t) => (
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

      {tab === 'jobs' && (
        <div className="mt-6 space-y-4">
          {bookings.length === 0 ? (
            <p className="text-ink/60">No job requests yet.</p>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="rounded-2xl border border-clay p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{b.household?.name}</p>
                    <p className="text-sm text-ink/60">
                      {b.servicePlan} plan &middot; ₹{b.price} &middot; starts{' '}
                      {new Date(b.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                {b.notes && <p className="mt-2 text-sm text-ink/60">Notes: {b.notes}</p>}
                <div className="mt-3 flex gap-3">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(b._id, 'accepted')}
                        className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-dark"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b._id, 'rejected')}
                        className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {b.status === 'accepted' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'active')}
                      className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-dark"
                    >
                      Start service
                    </button>
                  )}
                  {b.status === 'active' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'completed')}
                      className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-dark"
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="mt-6 space-y-4 max-w-xl">
          {saveStatus && <p className="rounded-lg bg-clay/60 px-4 py-2 text-sm text-ink/80">{saveStatus}</p>}
          <div>
            <label className="block text-sm font-medium text-ink/80">Bio</label>
            <textarea
              rows={3}
              value={profile.bio || ''}
              onChange={(e) => updateProfileField('bio', e.target.value)}
              className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">Skills (comma-separated)</label>
            <input
              value={(profile.skills || []).join(', ')}
              onChange={(e) => updateProfileField('skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80">Experience (years)</label>
              <input
                type="number"
                min="0"
                value={profile.experienceYears}
                onChange={(e) => updateProfileField('experienceYears', e.target.value)}
                className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">City</label>
              <input
                value={profile.city}
                onChange={(e) => updateProfileField('city', e.target.value)}
                className="mt-1 w-full rounded-lg border border-clay px-4 py-2.5 focus:border-forest outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Pricing</label>
            <div className="grid grid-cols-3 gap-3">
              {['hourly', 'monthly', 'yearly'].map((plan) => (
                <div key={plan}>
                  <label className="block text-xs text-ink/60 capitalize">{plan}</label>
                  <input
                    type="number"
                    min="0"
                    value={profile.pricing?.[plan] ?? ''}
                    onChange={(e) => updatePricing(plan, e.target.value)}
                    placeholder="₹"
                    className="mt-1 w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={profile.isAvailableForBooking}
              onChange={(e) => updateProfileField('isAvailableForBooking', e.target.checked)}
            />
            Currently accepting new bookings
          </label>
          <button
            type="submit"
            className="rounded-full bg-forest px-6 py-2.5 font-medium text-white hover:bg-forest-dark transition-colors"
          >
            Save profile
          </button>
        </form>
      )}

      {tab === 'documents' && (
        <div className="mt-6 max-w-xl">
          <p className="text-sm text-ink/60">
            Upload identity and background verification documents. An admin will review them before your profile
            becomes bookable. For this demo, paste a link to a hosted file rather than uploading a binary.
          </p>
          <form onSubmit={submitDocument} className="mt-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-ink/60">Document type</label>
              <select
                value={docForm.docType}
                onChange={(e) => setDocForm({ ...docForm, docType: e.target.value })}
                className="mt-1 rounded-lg border border-clay px-3 py-2 bg-white"
              >
                <option>Government ID</option>
                <option>Address Proof</option>
                <option>Police Verification</option>
                <option>Reference Letter</option>
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs text-ink/60">File URL</label>
              <input
                required
                value={docForm.fileUrl}
                onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-clay px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-white hover:bg-forest-dark"
            >
              Submit
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {(profile.verification.documents || []).map((doc, i) => (
              <div key={i} className="rounded-lg border border-clay px-4 py-2 text-sm flex justify-between">
                <span>{doc.docType}</span>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-forest hover:underline">
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'earnings' && (
        <div className="mt-6 rounded-2xl border border-clay p-6 max-w-md">
          <p className="text-sm text-ink/60">View-only in Phase 1. Payroll automation is planned for a future release.</p>
          <p className="mt-4 text-3xl font-display font-semibold text-forest">₹{profile.totalEarnings || 0}</p>
          <p className="text-sm text-ink/60">Total recorded earnings</p>
        </div>
      )}
    </div>
  );
};

export default HelperDashboard;