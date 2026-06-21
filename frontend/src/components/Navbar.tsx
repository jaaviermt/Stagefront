import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar: FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const navLinks = [
    { label: "Eventos", to: "/events" },
    { label: "Reventas", to: "/resales" },
    { label: "Mis compras", to: "/orders" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-brand-black/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-xl font-bold tracking-tight text-brand-white hover:text-brand-red transition-colors duration-200"
        >
          STAGEFRONT
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className={`text-sm transition-colors duration-200 cursor-pointer ${
                  location.pathname === to
                    ? "text-brand-white"
                    : "text-brand-gray/70 hover:text-brand-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-brand-white cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-brand-black/95 border-t border-white/10 px-6 py-6 space-y-4">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="block text-brand-gray hover:text-brand-white transition-colors duration-200 text-lg"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
