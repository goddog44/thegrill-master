import { useState } from 'react';
import { ArrowLeft, Loader, User, Phone, MapPin, ShoppingBag, DollarSign } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onBack: () => void;
}

export const Checkout = ({ onBack }: CheckoutProps) => {
  const { items, getTotalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        total_amount: getTotalAmount(),
        status: 'pending',
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Message WhatsApp - garde les emojis car c'est du texte pur
      const whatsappMessage = encodeURIComponent(
        `🍽️ *Nouvelle commande - The Grill Master*\n\n` +
        `👤 Nom: ${formData.name}\n` +
        `📱 Téléphone: ${formData.phone}\n` +
        `📍 ${formData.address}\n\n` +
        `*Détails de la commande:*\n` +
        items.map(item =>
          `• ${item.product.name} x${item.quantity} = ${item.product.price * item.quantity} FCFA`
        ).join('\n') +
        `\n\n💰 *Total: ${getTotalAmount()} FCFA*\n\n` +
        `Commande #${order.id.substring(0, 8)}`
      );

      const whatsappNumber = '237655613839';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

      clearCart();
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-emerald-700 p-2 rounded">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Validation de commande</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="text-emerald-600" size={20} />
            <h2 className="font-bold text-lg text-gray-800">Récapitulatif</h2>
          </div>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-semibold">
                  {item.product.price * item.quantity} FCFA
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={20} />
              <span>Total</span>
            </div>
            <span className="text-emerald-600">{getTotalAmount()} FCFA</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">
            Vos informations
          </h2>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User size={16} />
                Nom complet
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Phone size={16} />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="+237 6XX XX XX XX"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MapPin size={16} />
                Adresse de livraison ou retrait
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Adresse complète ou 'Retrait au restaurant'"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Envoi en cours...
                </>
              ) : (
                'Confirmer ma commande'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};