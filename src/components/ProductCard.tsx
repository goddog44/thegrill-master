import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Vérifier si le produit est déjà dans le panier
  const cartItem = items.find(item => item.product.id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 600);
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image avec badge */}
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
        
        {/* Badge si produit dans le panier */}
        {inCartQuantity > 0 && (
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
            <ShoppingCart size={12} />
            {inCartQuantity}
          </div>
        )}

        {/* Badge promotion (optionnel - si vous ajoutez un champ promotion) */}
        {product.is_promotion && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            -20%
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Nom et notation */}
        <div className="mb-2">
          <h3 className="font-bold text-gray-800 text-base line-clamp-2 mb-1">
            {product.name}
          </h3>
          
          {/* Étoiles de notation (optionnel) */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(4.0)</span>
          </div>
        </div>

        {/* Description courte (si disponible) */}
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Prix */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl font-bold text-emerald-600">
              {product.price.toLocaleString()} 
              <span className="text-sm font-normal text-gray-500 ml-1">FCFA</span>
            </p>
            {product.old_price && (
              <p className="text-xs text-gray-400 line-through">
                {product.old_price.toLocaleString()} FCFA
              </p>
            )}
          </div>

          {/* Disponibilité */}
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
            product.available !== false 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {product.available !== false ? 'Disponible' : 'Épuisé'}
          </div>
        </div>

        {/* Sélecteur de quantité */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600 font-medium">Quantité:</span>
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={decrementQuantity}
              className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors active:scale-95"
              disabled={quantity <= 1}
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="px-4 font-bold text-gray-800 min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors active:scale-95"
              disabled={quantity >= 10}
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bouton d'ajout au panier */}
        <button
          onClick={handleAddToCart}
          disabled={product.available === false || isAdding}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-95 ${
            isAdding
              ? 'bg-green-500 text-white'
              : product.available === false
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg'
          }`}
        >
          {isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Ajouté !
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Ajouter {quantity > 1 && `(${quantity})`}
            </>
          )}
        </button>

        {/* Prix total si quantité > 1 */}
        {quantity > 1 && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Total: {(product.price * quantity).toLocaleString()} FCFA
          </p>
        )}
      </div>
    </div>
  );
};