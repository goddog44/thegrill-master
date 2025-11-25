import { useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import { HomePage } from './components/HomePage';
import { Checkout } from './components/Checkout';

function App() {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <CartProvider>
      {showCheckout ? (
        <Checkout onBack={() => setShowCheckout(false)} />
      ) : (
        <HomePage onCheckout={() => setShowCheckout(true)} />
      )}
    </CartProvider>
  );
}

export default App;
