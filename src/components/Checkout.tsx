import { useState } from 'react';
import { ArrowLeft, Loader, User, Phone, MapPin, ShoppingBag, DollarSign, MapPinned } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { useSound } from '../hooks/useSound';
import { Restaurant3DMap, RestaurantTable } from './RestaurantMap';

interface CheckoutProps {
  onBack: () => void;
}

export const Checkout = ({ onBack }: CheckoutProps) => {
  const { items, getTotalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // Sons
  const playBack = useSound('/sounds/click1.mp3');
  const playFocus = useSound('/sounds/click1.mp3');
  const playSubmit = useSound('/sounds/click1.mp3');
  const playSuccess = useSound('/sounds/click4.mp3');
  const playError = useSound('/sounds/click1.mp3');

  const handleBack = () => {
    playBack();
    onBack();
  };

  const handleTableSelect = (table: RestaurantTable) => {
    setSelectedTable(table);
  };

  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case 'interieur': return 'Intérieur';
      case 'terrasse': return 'Terrasse';
      case 'vip': return 'VIP';
      default: return zone;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playSubmit();
    setLoading(true);

    try {
      // Données de commande (avec ou sans table)
      const orderData: any = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        total_amount: getTotalAmount(),
        status: 'pending',
      };

      // Ajouter les infos de table si sélectionnée
      if (selectedTable) {
        orderData.table_id = selectedTable.id;    
        orderData.table_number = selectedTable.table_number; 
      }

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

      playSuccess();

      // Message WhatsApp avec ou sans table
      let whatsappMessage = `🍽️ *Nouvelle commande - The Grill Master*\n\n`;
      
      if (selectedTable) {
        whatsappMessage += `🪑 *Table #${selectedTable.table_number}* (${getZoneLabel(selectedTable.zone)})\n`;
      }
      
      whatsappMessage += 
        `👤 Nom: ${formData.name}\n` +
        `📱 Téléphone: ${formData.phone}\n` +
        `📍 ${formData.address || 'Non spécifié'}\n\n` +
        `*Détails de la commande:*\n` +
        items.map(item =>
          `• ${item.product.name} x${item.quantity} = ${item.product.price * item.quantity} FCFA`
        ).join('\n') +
        `\n\n💰 *Total: ${getTotalAmount()} FCFA*\n\n` +
        `Commande #${order.id.substring(0, 8)}`;

      const whatsappUrl = `https://wa.me/237655613839?text=${encodeURIComponent(whatsappMessage)}`;

      clearCart();
      
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      playError();
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={handleBack} 
            className="hover:bg-emerald-700 p-2 rounded-lg transition-all active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Validation de commande</h1>
            <p className="text-emerald-100 text-xs">Dernière étape avant votre commande</p>
          </div>
        </div>
      </div>

      <div className="max-w-md lg:max-w-4xl mx-auto p-4 lg:p-6">
        
        {/* Sélection de table (optionnel) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <MapPinned className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-800">Sélectionner une table</h2>
                <p className="text-xs text-gray-500">Optionnel - pour manger sur place</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-colors"
            >
              {showMap ? 'Masquer la carte' : 'Voir la carte'}
            </button>
          </div>

          {/* Table sélectionnée */}
          {selectedTable && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
              <div>
                <p className="font-bold text-emerald-800">
                  Table #{selectedTable.table_number}
                </p>
                <p className="text-sm text-emerald-600">
                  {getZoneLabel(selectedTable.zone)} • {selectedTable.capacity} places
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Carte du restaurant */}
          {showMap && (
            <div className="mt-4">
              <Restaurant3DMap
                onSelectTable={handleTableSelect}
                selectedTableId={selectedTable?.id}
              />
            </div>
          )}
        </div>

        

        {/* Récapitulatif */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ShoppingBag className="text-emerald-600" size={20} />
            </div>
            <h2 className="font-bold text-lg text-gray-800">Récapitulatif</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.product.image_url} 
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">
                  {(item.product.price * item.quantity).toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
              <span className="text-gray-800">Total</span>
            </div>
            <span className="text-emerald-600">{getTotalAmount().toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <User className="text-emerald-600" size={20} />
            </div>
            <h2 className="font-bold text-lg text-gray-800">Vos informations</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="text-emerald-600" />
                Nom complet
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={playFocus}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="text-emerald-600" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onFocus={playFocus}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="+237 6XX XX XX XX"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="text-emerald-600" />
                Adresse de livraison ou notes
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onFocus={playFocus}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="Ex: Biyem Assi, près du carrefour ou 'Retrait au restaurant'"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 {selectedTable ? 'Vous avez sélectionné une table pour manger sur place' : 'Précisez votre adresse pour la livraison'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={22} />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Confirmer ma commande
                  {selectedTable && ` (Table #${selectedTable.table_number})`}
                </>
              )}
            </button>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 text-center">
                Votre commande sera envoyée directement sur WhatsApp
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};