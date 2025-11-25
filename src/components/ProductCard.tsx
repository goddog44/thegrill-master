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

  const cartItem = items.find(item => item.product.id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) addToCart(product);

    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 600);
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

      {/* IMAGE */}
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-36 sm:h-40 object-cover"
        />

        {/* BADGE PANIER */}
        {inCartQuantity > 0 && (
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
            <ShoppingCart size={10} />
            {inCartQuantity}
          </div>
        )}

        {/* GRADIENT BAS */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* CONTENT */}
      <div className="p-3 sm:p-4">

        {/* NOM + ÉTOILES */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 mb-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="text-[10px] text-gray-500 ml-1">(4.0)</span>
          </div>
        </div>

        {/* PRIX + DISPONIBILITÉ */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg sm:text-xl font-bold text-emerald-600">
            {product.price.toLocaleString()}
            <span className="text-xs text-gray-500 ml-1">FCFA</span>
          </p>

          <div
            className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full ${
              product.available
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.available ? "Disponible" : "Épuisé"}
          </div>
        </div>

        {/* QUANTITÉ */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Qté:</span>

          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="p-2 active:scale-95 disabled:opacity-40"
            >
              <Minus size={14} />
            </button>

            <span className="px-3 sm:px-4 font-bold text-gray-800 text-sm min-w-[2rem] text-center">
              {quantity}
            </span>

            <button
              onClick={incrementQuantity}
              disabled={quantity >= 10}
              className="p-2 active:scale-95 disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* BOUTON AJOUTER */}
        <button
          onClick={handleAddToCart}
          disabled={!product.available || isAdding}
          className={`w-full py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-95 ${
            isAdding
              ? "bg-green-500 text-white"
              : !product.available
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg"
          }`}
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Ajouté !
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Ajouter {quantity > 1 && `(${quantity})`}
            </>
          )}
        </button>

        {/* TOTAL */}
        {quantity > 1 && (
          <p className="text-center text-[11px] text-gray-500 mt-2">
            Total: {(product.price * quantity).toLocaleString()} FCFA
          </p>
        )}
      </div>
    </div>
  );
};
