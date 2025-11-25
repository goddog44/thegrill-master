import { Plus } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-lg font-bold text-emerald-600 mb-3">
          {product.price} FCFA
        </p>
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};
