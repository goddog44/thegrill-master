import { ShoppingCart, Trash2, Minus, Plus, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import { useSound } from '../hooks/useSound';

interface CartProps {
  onCheckout: () => void;
}

export const Cart = ({ onCheckout }: CartProps) => {
  const { items, removeFromCart, updateQuantity, getTotalAmount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // Sons
  const playOpen = useSound('/sounds/click1.mp3');
  const playClose = useSound('/sounds/click1.mp3');
  const playClick = useSound('/sounds/click3.mp3');
  const playRemove = useSound('/sounds/click1.mp3');
  const playCheckout = useSound('/sounds/click4.mp3');

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpen = () => {
    playOpen();
    setIsOpen(true);
  };

  const handleClose = () => {
    playClose();
    setIsOpen(false);
  };

  const handleIncrement = (productId: string, currentQuantity: number) => {
    playClick();
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
    playClick();
    updateQuantity(productId, currentQuantity - 1);
  };

  const handleRemove = (productId: string) => {
    playRemove();
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    playCheckout();
    setIsOpen(false);
    onCheckout();
  };

  return (
    <>
      {/* Bouton panier flottant */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 z-40"
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {itemCount}
          </span>
        )}
      </button>

      {/* Modal du panier */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center animate-fade-in">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-emerald-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-emerald-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  Mon Panier {itemCount > 0 && `(${itemCount})`}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-all active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <ShoppingCart size={64} className="text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Votre panier est vide</p>
                  <p className="text-sm text-gray-400 mt-1">Ajoutez des produits pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 bg-gray-50 p-3 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-emerald-600 font-bold text-sm mb-2">
                          {item.product.price.toLocaleString()} FCFA × {item.quantity}
                        </p>
                        
                        {/* Contrôles de quantité */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                            <button
                              onClick={() => handleDecrement(item.product.id, item.quantity)}
                              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors active:scale-95"
                            >
                              <Minus size={14} className="text-gray-600" />
                            </button>
                            <span className="font-bold text-gray-800 px-3 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item.product.id, item.quantity)}
                              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors active:scale-95"
                            >
                              <Plus size={14} className="text-gray-600" />
                            </button>
                          </div>
                          
                          {/* Prix total de la ligne */}
                          <span className="text-sm font-semibold text-gray-700 ml-auto mr-2">
                            {(item.product.price * item.quantity).toLocaleString()} FCFA
                          </span>
                          
                          {/* Bouton supprimer */}
                          <button
                            onClick={() => handleRemove(item.product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all active:scale-95"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer avec total et bouton commander */}
            {items.length > 0 && (
              <div className="border-t bg-gray-50 p-4 space-y-3">
                {/* Récapitulatif */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span>{getTotalAmount().toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Articles</span>
                    <span>{itemCount} {itemCount > 1 ? 'articles' : 'article'}</span>
                  </div>
                </div>
                
                {/* Séparateur */}
                <div className="h-px bg-gray-300"></div>
                
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-emerald-600 text-2xl">
                    {getTotalAmount().toLocaleString()} FCFA
                  </span>
                </div>
                
                {/* Bouton commander */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Valider la commande
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};