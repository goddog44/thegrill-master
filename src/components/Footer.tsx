import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      // Afficher à 150px du bas
      setShowFooter(scrollPosition >= pageHeight - 150);
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ${
        showFooter
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
      }`}
    >
      <div className="backdrop-blur-xl bg-white/95 border-t border-emerald-100 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/images/the-grill-master-logo.png"
                alt="The Grill Master"
                className="w-12 h-12 object-contain"
              />

              <div>
                <h3 className="font-bold text-emerald-700">
                  The Grill Master
                </h3>
                <p className="text-sm text-gray-500">
                  Grillades authentiques
                </p>
              </div>
            </div>

            {/* Contacts */}
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="tel:+237655613839"
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
              >
                <Phone size={18} />
                <span>+237 655 613 839</span>
              </a>

              <a
                href="mailto:thegrillmaster@gmail.com"
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
              >
                <Mail size={18} />
                <span>thegrillmaster@gmail.com</span>
              </a>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} />
                <span>Biyem Assi, Entrée Savanne</span>
              </div>
            </div>
          </div>
{/* 
          <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col lg:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-500">
              Développé par Essono Jordan Ryan
            </p>

            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} The Grill Master
            </p>
          </div> */}
        </div>
      </div>
    </footer>
  );
};