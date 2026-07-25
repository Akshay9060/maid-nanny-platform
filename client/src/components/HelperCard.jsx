import { Link } from 'react-router-dom';

const serviceLabels = {
  maid: 'Maid',
  babysitter: 'Babysitter',
  nanny: 'Nanny',
};

const formatPrice = (pricing) => {
  if (pricing?.hourly) return `₹${pricing.hourly}/hr`;
  if (pricing?.monthly) return `₹${pricing.monthly}/mo`;
  if (pricing?.yearly) return `₹${pricing.yearly}/yr`;
  return 'Contact for pricing';
};

const HelperCard = ({ helper }) => {
  const isVerified = helper.verification?.status === 'approved';
  return (
    <Link
      to={`/helpers/${helper._id}`}
      className="group block rounded-2xl border border-clay bg-white p-5 transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{helper.user?.name}</p>
          <p className="text-sm text-ink/60">{serviceLabels[helper.serviceType]} &middot; {helper.city}</p>
        </div>
        {isVerified ? (
          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
            Verified
          </span>
        ) : (
          <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-ink/50">
            Pending
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-ink/70 line-clamp-2">{helper.bio}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(helper.skills || []).slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-full bg-clay px-2.5 py-1 text-xs text-ink/70">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-clay pt-3">
        <span className="text-sm font-semibold text-marigold-dark">{formatPrice(helper.pricing)}</span>
        <span className="text-sm text-ink/60">
          {helper.experienceYears} yr{helper.experienceYears === 1 ? '' : 's'} exp &middot; ★{' '}
          {helper.ratingAverage?.toFixed(1) || 'New'}
        </span>
      </div>
    </Link>
  );
};

export default HelperCard;
