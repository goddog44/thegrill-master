import { useEffect, useState } from 'react';
import { Loader, Flame, UtensilsCrossed, Phone, Mail, MapPin } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { CategorySection } from './CategorySection';
import grillLogo from '/images/the-grill-master-logo.png';
import { Cart } from './Cart';

interface HomePageProps {
  onCheckout: () => void;
}

export const HomePage = ({ onCheckout }: HomePageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Grillades', 'Accompagnements', 'Boissons', 'Sauces', 'Eau Minerale'];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background avec pattern et gradient */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient de base */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-gray-50 to-orange-50"></div>
        
        {/* Pattern géométrique subtil */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Formes décoratives flottantes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Fixed */}
      <header className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white fixed top-0 left-0 right-0 z-50 shadow-2xl">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute inset-0 bg-black/10 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-md lg:max-w-7xl mx-auto px-6 py-3">
          {/* Section logo et titre */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <img 
                  src={grillLogo}
                  alt="Grill Master Logo"
                  className="relative w-16 h-16 lg:w-20 lg:h-20 object-contain drop-shadow-2xl"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2">
                  The Grill Master
                  <Flame className="text-orange-400 animate-pulse" size={24} />
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <UtensilsCrossed size={16} className="text-emerald-200" />
                  <p className="text-emerald-100 text-sm lg:text-base font-medium">
                    Savourez nos grillades authentiques
                  </p>
                </div>
              </div>
            </div>

            {/* Contact rapide desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <a 
                href="tel:+237655613839"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 transition-colors"
              >
                <Phone size={18} />
                <span className="text-sm font-semibold">+237 655 613 839</span>
              </a>
            </div>
          </div>

          {/* Badge décoratif */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm font-semibold text-white">
              Commandez maintenant et recevez votre commande rapidement!
            </span>
          </div>
        </div>

        {/* Bordure décorative en bas */}
        <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
      </header>

      {/* Main Content avec padding pour header et footer */}
      <main className="flex-1 max-w-md lg:max-w-7xl mx-auto w-full px-4 lg:px-6 pt-[180px] pb-[280px] lg:pt-[200px] lg:pb-[220px]">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-10">
            {categories.map((category) => (
              <CategorySection
                key={category}
                category={category}
                products={products}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Fixed */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white fixed bottom-0 left-0 right-0 z-40 shadow-2xl">
        {/* Pattern subtil dans le footer */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="max-w-md lg:max-w-7xl mx-auto px-6 py-2 lg:py-4 relative">
          {/* Layout mobile: vertical | Layout desktop: horizontal */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Logo et nom */}
            <div className="flex items-center gap-3 mb-4 lg:mb-0">
              <img 
                src={grillLogo}
                alt="Grill Master Logo"
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
              />
              <div>
                <h3 className="text-lg lg:text-xl font-bold">The Grill Master</h3>
                <p className="text-gray-400 text-xs lg:text-sm">Grillades authentiques</p>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-3 mb-4 lg:mb-0 lg:col-span-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <a 
                  href="tel:+237655613839"
                  className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors group"
                >
                  <div className="bg-emerald-600/20 p-2 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
                    <Phone size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium">+237 655 613 839</p>
                  </div>
                </a>

                <a 
                  href="mailto:thegrillmaster@gmail.com"
                  className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors group"
                >
                  <div className="bg-emerald-600/20 p-2 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
                    <Mail size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Email</p>
                    <p className="text-sm font-medium">thegrillmaster@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 text-gray-300">
                  <div className="bg-emerald-600/20 p-2 rounded-lg">
                    <MapPin size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Adresse</p>
                    <p className="text-sm font-medium">Biyem Assi, Entrée Savanne</p>
                    <p className="text-xs text-gray-400">Yaoundé, Cameroun</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4"></div>

          {/* Copyright */}
          <div className="text-center lg:flex lg:justify-between lg:items-center">
            <p className="text-gray-400 text-xs flex items-center justify-center lg:justify-start gap-1 mb-1 lg:mb-0">
              Développé par Essono Jordan Ryan
            </p>
            <p className="text-gray-500 text-[10px]">
              © {new Date().getFullYear()} The Grill Master - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>

      <Cart onCheckout={onCheckout} />
    </div>
  );
};