import { useEffect, useState } from 'react';
import { Flame, Phone } from 'lucide-react';
import grillLogo from '/images/the-grill-master-logo.png';

export const Header = () => {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false); // scroll vers le bas
      } else {
        setShowHeader(true); // scroll vers le haut
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showHeader
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      }`}
    >
      <div className="backdrop-blur-xl bg-white/95 border-b border-emerald-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={grillLogo}
                alt="The Grill Master"
                className="w-14 h-14 object-contain"
              />

              <div>
                <h1 className="text-xl lg:text-2xl font-extrabold text-emerald-700">
                  The Grill Master
                </h1>

                <p className="text-xs lg:text-sm text-gray-500">
                  Grillades • Sauces • Accompagnements
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-4">
              <a
                href="tel:+237655613839"
                className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full transition"
              >
                <Phone size={16} />
                <span>+237 655 613 839</span>
              </a>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">
                  Ouvert
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};