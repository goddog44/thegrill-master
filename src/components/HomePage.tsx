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
    <div className="min-h-screen relative">
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

      <header className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white sticky top-0 z-10 shadow-2xl">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute inset-0 bg-black/10 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-md mx-auto px-6 py-8">
          {/* Section logo et titre */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <img 
                  src={grillLogo}
                  alt="Grill Master Logo"
                  className="relative w-16 h-16 object-contain drop-shadow-2xl"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  The Grill Master
                  <Flame className="text-orange-400 animate-pulse" size={24} />
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <UtensilsCrossed size={16} className="text-emerald-200" />
                  <p className="text-emerald-100 text-sm font-medium">
                    Savourez nos grillades authentiques
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge décoratif */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-white">
              Commandez maintenant et recois ta commande rapidement!
            </span>
          </div>
        </div>

        {/* Bordure décorative en bas */}
        <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
      </header>

      <main className="max-w-md mx-auto pt-6 pb-32 relative">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
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

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-8 pb-10 relative">
        {/* Pattern subtil dans le footer */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="max-w-md mx-auto px-6 py-4 relative">
          {/* Logo et nom */}
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={grillLogo}
              alt="Grill Master Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h3 className="text-lg font-bold">The Grill Master</h3>
              <p className="text-gray-400 text-xs">Grillades authentiques</p>
            </div>
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4"></div>

          {/* Informations de contact */}
          <div className="space-y-3 mb-4">
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

          {/* Séparateur */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4"></div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
              Essono Jordan Ryan
            </p>
            <p className="text-gray-500 text-[10px] mt-1">
              © {new Date().getFullYear()} Tous droits réservés
            </p>
          </div>
        </div>
      </footer>

      <Cart onCheckout={onCheckout} />
    </div>
  );
};