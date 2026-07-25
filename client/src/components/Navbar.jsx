import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  household: '/dashboard',
  helper: '/helper/dashboard',
  admin: '/admin',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-clay bg-sand/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-2xl font-semibold text-forest">
          Ghar Sahay
        </Link>

        <div className="flex items-center gap-6 font-medium text-sm">
          <Link to="/helpers" className="text-ink/80 hover:text-forest">
            Find help
          </Link>

          {!user && (
            <>
              <Link to="/login" className="text-ink/80 hover:text-forest">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-forest px-4 py-2 text-white hover:bg-forest-dark transition-colors"
              >
                Get started
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to={roleHome[user.role] || '/'} className="text-ink/80 hover:text-forest">
                My dashboard
              </Link>
              <span className="hidden sm:inline text-ink/50">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-forest px-4 py-2 text-forest hover:bg-forest hover:text-white transition-colors"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
