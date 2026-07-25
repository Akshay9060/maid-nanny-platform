import { Link } from 'react-router-dom';

const steps = [
  { label: 'Search', text: 'Filter by service type, city, experience, and plan.' },
  { label: 'Review', text: 'Check verification badges, skills, and ratings.' },
  { label: 'Book', text: 'Choose hourly, monthly, or yearly — send a request.' },
  { label: 'Start', text: 'The helper accepts, and service begins as scheduled.' },
];

const pillars = [
  {
    title: 'Verified, not just listed',
    text: 'Every helper submits identity and background documents for admin review before they can be booked.',
  },
  {
    title: 'Plans that fit real life',
    text: 'Hourly for one-off needs, monthly for regular care, yearly for long-term households.',
  },
  {
    title: 'A record you can trust',
    text: 'Ratings, service history, and reliability scores replace word-of-mouth guesswork.',
  },
];

const Home = () => (
  <div>
    {/* Hero */}
    <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-block rounded-full bg-marigold/15 px-3 py-1 text-xs font-semibold tracking-wide text-marigold-dark uppercase">
          Verified domestic help, on your terms
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-semibold text-ink leading-tight">
          Hiring a maid or nanny shouldn't feel like a gamble.
        </h1>
        <p className="mt-5 text-lg text-ink/70">
          Ghar Sahay replaces unverified agents and word-of-mouth with background-checked helpers,
          transparent pricing, and a booking record you can actually rely on.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/helpers"
            className="rounded-full bg-forest px-6 py-3 text-white font-medium hover:bg-forest-dark transition-colors"
          >
            Find verified help
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-forest px-6 py-3 text-forest font-medium hover:bg-forest/5 transition-colors"
          >
            Register as a helper
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-forest text-white p-8">
        <p className="font-display text-xl">Why households switch to Ghar Sahay</p>
        <ul className="mt-6 space-y-4 text-sm text-white/90">
          <li className="flex gap-3">
            <span className="font-display text-marigold-light">01</span>
            No more sudden absenteeism with no replacement plan.
          </li>
          <li className="flex gap-3">
            <span className="font-display text-marigold-light">02</span>
            No more guessing who is actually background-verified.
          </li>
          <li className="flex gap-3">
            <span className="font-display text-marigold-light">03</span>
            No more informal cash arrangements with no accountability.
          </li>
        </ul>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-clay/60 py-16">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="text-2xl font-semibold text-ink">How it works</h2>
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.label} className="rounded-2xl bg-white p-5 border border-clay">
              <span className="font-display text-2xl text-marigold-dark">{i + 1}</span>
              <p className="mt-2 font-semibold text-ink">{step.label}</p>
              <p className="mt-1 text-sm text-ink/60">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pillars */}
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-2xl font-semibold text-ink">Built on trust and transparency</h2>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-2xl border border-clay p-6">
            <p className="font-display text-lg font-semibold text-forest">{p.title}</p>
            <p className="mt-2 text-sm text-ink/70">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
