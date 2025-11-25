import { Product } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { Flame, Salad, Coffee, Droplet } from 'lucide-react';

interface CategorySectionProps {
  category: string;
  products: Product[];
}

const categoryIcons = {
  'Grillades': Flame,
  'Accompagnements': Salad,
  'Boissons': Coffee,
  'Sauces': Droplet,
};

const categoryColors = {
  'Grillades': 'from-orange-500 to-red-500',
  'Accompagnements': 'from-green-500 to-emerald-500',
  'Boissons': 'from-blue-500 to-cyan-500',
  'Sauces': 'from-amber-500 to-yellow-500',
  'Eau Minerale': 'from-teal-500 to-cyan-500',
};

export const CategorySection = ({ category, products }: CategorySectionProps) => {
  const categoryProducts = products.filter((p) => p.category === category);
  
  if (categoryProducts.length === 0) return null;

  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Flame;
  const gradientColor = categoryColors[category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';

  return (
    <section className="mb-8">
      {/* En-tête de catégorie avec icône et badge */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className={`bg-gradient-to-br ${gradientColor} p-2.5 rounded-xl shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {category}
            </h2>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            {categoryProducts.length} {categoryProducts.length > 1 ? 'articles' : 'article'}
          </span>
        </div>
        
        {/* Ligne décorative */}
        <div className={`h-1 bg-gradient-to-r ${gradientColor} rounded-full w-20 opacity-60`}></div>
      </div>

      {/* Grille de produits */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};