import { useEffect, useState } from 'react';
import { Loader, Flame, UtensilsCrossed } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { CategorySection } from './CategorySection';
import grillLogo from '../../data/1-removebg-preview.png';
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

  const categories = ['Grillades', 'Accompagnements', 'Boissons', 'Sauces'];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
              Commandez maintenant • Livraison rapide
            </span>
          </div>
        </div>

        {/* Bordure décorative en bas */}
        <div className="h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
      </header>

      <main className="max-w-md mx-auto pt-6">
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

      <Cart onCheckout={onCheckout} />
    </div>
  );
};