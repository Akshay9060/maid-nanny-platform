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

const HouseholdDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewState, setReviewState] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'cancelled', note: 'Cancelled by household' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel booking.');
    }
  };

  const submitReview = async (bookingId) => {
    const { rating = 5, comment = '' } = reviewState[bookingId] || {};
    try {
      await api.post('/reviews', { bookingId, rating: Number(rating), comment });
      setReviewState((prev) => ({ ...prev, [bookingId]: { ...prev[bookingId], submitted: true } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review.');
    }
  };

  if (loading) return <p className="mx-auto max-w-5xl px-5 py-16 text-ink/60">Loading...</p>;
  if (error) return <p className="mx-auto max-w-5xl px-5 py-16 text-red-700">{error}</p>;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl font-semibold text-ink">My bookings</h1>
      <p className="mt-2 text-ink/60">Track service requests and leave feedback once work is complete.</p>

      {bookings.length === 0 ? (
        <p className="mt-10 text-ink/60">No bookings yet. Head to "Find help" to book your first helper.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="rounded-2xl border border-clay p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{b.helper?.user?.name || 'Helper'}</p>
                  <p className="text-sm text-ink/60">
                    {b.servicePlan} plan &middot; ₹{b.price} &middot; starts {new Date(b.startDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[b.status]}`}>
                  {b.status}
                </span>
              </div>

              {b.notes && <p className="mt-2 text-sm text-ink/60">Notes: {b.notes}</p>}

              <div className="mt-3 flex gap-3">
                {['pending', 'accepted'].includes(b.status) && (
                  <button
                    onClick={() => cancelBooking(b._id)}
                    className="text-sm font-medium text-red-700 hover:underline"
                  >
                    Cancel booking
                  </button>
                )}
              </div>

              {b.status === 'completed' && !reviewState[b._id]?.submitted && (
                <div className="mt-4 rounded-xl bg-clay/50 p-4">
                  <p className="text-sm font-medium text-ink/80 mb-2">Rate this service</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={reviewState[b._id]?.rating || 5}
                      onChange={(e) =>
                        setReviewState((prev) => ({
                          ...prev,
                          [b._id]: { ...prev[b._id], rating: e.target.value },
                        }))
                      }
                      className="rounded-lg border border-clay px-3 py-2 bg-white"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star{n === 1 ? '' : 's'}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Optional comment"
                      value={reviewState[b._id]?.comment || ''}
                      onChange={(e) =>
                        setReviewState((prev) => ({
                          ...prev,
                          [b._id]: { ...prev[b._id], comment: e.target.value },
                        }))
                      }
                      className="flex-1 min-w-[180px] rounded-lg border border-clay px-3 py-2"
                    />
                    <button
                      onClick={() => submitReview(b._id)}
                      className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-dark"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              {reviewState[b._id]?.submitted && (
                <p className="mt-3 text-sm text-forest">Thanks for your feedback!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HouseholdDashboard;