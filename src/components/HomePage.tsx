import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { CategorySection } from './CategorySection';
import { Header } from './Header';
import { Footer } from './Footer';
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

      <Header />

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

      <Footer />

      <Cart onCheckout={onCheckout} />
    </div>
  );
};