import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto max-w-lg px-5 py-24 text-center">
    <p className="font-display text-6xl text-forest">404</p>
    <p className="mt-3 text-ink/70">This page doesn't exist.</p>
    <Link to="/" className="mt-6 inline-block rounded-full bg-forest px-6 py-2.5 text-white hover:bg-forest-dark">
      Back home
    </Link>
  </div>
);

export default NotFound;
