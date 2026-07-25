import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const serviceLabels = { maid: 'Maid', babysitter: 'Babysitter', nanny: 'Nanny' };

const HelperProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [helper, setHelper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [booking, setBooking] = useState({ servicePlan: 'hourly', startDate: '', notes: '' });
  const [bookingStatus, setBookingStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [helperRes, reviewsRes] = await Promise.all([
          api.get(`/helpers/${id}`),
          api.get(`/reviews/helper/${id}`),
        ]);
        setHelper(helperRes.data.helper);
        setReviews(reviewsRes.data.reviews);
      } catch {
        setError('Could not load this profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const availablePlans = helper
    ? Object.entries(helper.pricing || {}).filter(([, price]) => price !== null && price !== undefined)
    : [];

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingStatus('');

    if (!user) {
      navigate('/login', { state: { from: `/helpers/${id}` } });
      return;
    }
    if (user.role !== 'household') {
      setBookingStatus('Only household accounts can book a helper.');
      return;
    }

    try {
      await api.post('/bookings', {
        helperId: id,
        servicePlan: booking.servicePlan,
        startDate: booking.startDate,
        notes: booking.notes,
      });
      setBookingStatus('success');
    } catch (err) {
      setBookingStatus(err.response?.data?.message || 'Could not send booking request.');
    }
  };

  if (loading) return <p className="mx-auto max-w-4xl px-5 py-16 text-ink/60">Loading profile...</p>;
  if (error || !helper) return <p className="mx-auto max-w-4xl px-5 py-16 text-red-700">{error || 'Not found.'}</p>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-ink">{helper.user?.name}</h1>
          {helper.verification?.status === 'approved' ? (
            <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">Verified</span>
          ) : (
            <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-ink/50">
              Pending verification
            </span>
          )}
        </div>
        <p className="mt-1 text-ink/60">
          {serviceLabels[helper.serviceType]} &middot; {helper.city} &middot; {helper.experienceYears} yrs experience
        </p>

        <p className="mt-6 text-ink/80">{helper.bio}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(helper.skills || []).map((skill) => (
            <span key={skill} className="rounded-full bg-clay px-3 py-1 text-sm text-ink/70">
              {skill}
            </span>
          ))}
        </div>

        {helper.availability?.timeSlot && (
          <p className="mt-6 text-sm text-ink/60">
            <span className="font-medium text-ink/80">Availability:</span>{' '}
            {(helper.availability.days || []).join(', ')} &middot; {helper.availability.timeSlot}
          </p>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-ink">
            Reviews {helper.ratingCount > 0 && `(★ ${helper.ratingAverage.toFixed(1)} · ${helper.ratingCount})`}
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No reviews yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="rounded-xl border border-clay p-4">
                  <p className="font-medium text-ink">
                    {r.household?.name} &middot; ★ {r.rating}
                  </p>
                  {r.comment && <p className="mt-1 text-sm text-ink/70">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking panel */}
      <aside className="rounded-2xl border border-clay p-6 h-fit sticky top-24">
        <p className="font-display text-lg font-semibold text-ink">Book this helper</p>

        {bookingStatus === 'success' ? (
          <p className="mt-4 rounded-lg bg-forest/10 px-4 py-3 text-sm text-forest">
            Request sent! You can track its status from your dashboard.
          </p>
        ) : (
          <form onSubmit={handleBook} className="mt-4 space-y-3">
            {bookingStatus && bookingStatus !== 'success' && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{bookingStatus}</p>
            )}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Plan</label>
              <select
                value={booking.servicePlan}
                onChange={(e) => setBooking({ ...booking, servicePlan: e.target.value })}
                className="w-full rounded-lg border border-clay px-3 py-2 bg-white focus:border-forest outline-none"
              >
                {availablePlans.map(([plan, price]) => (
                  <option key={plan} value={plan}>
                    {plan[0].toUpperCase() + plan.slice(1)} — ₹{price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Start date</label>
              <input
                type="date"
                required
                value={booking.startDate}
                onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Notes (optional)</label>
              <textarea
                rows={3}
                value={booking.notes}
                onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                className="w-full rounded-lg border border-clay px-3 py-2 focus:border-forest outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={availablePlans.length === 0}
              className="w-full rounded-full bg-forest py-2.5 font-medium text-white hover:bg-forest-dark transition-colors disabled:opacity-50"
            >
              {availablePlans.length === 0 ? 'No plans available' : 'Send booking request'}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
};

export default HelperProfile;
