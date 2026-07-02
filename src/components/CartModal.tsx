import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, Plus, Minus, MessageCircle, User, MapPin, Phone } from 'lucide-react';
import { CartItem, Settings, Order, CustomerData } from '../types';
import { formatRupiah } from '../utils';
import { saveOrder } from '../firebaseUtils';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  settings: Settings;
}

export default function CartModal({ isOpen, onClose, cart, setCart, settings }: CartModalProps) {
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    address: '',
    phone: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('customerData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCustomer(prev => ({
            name: prev.name || parsed.name || '',
            address: prev.address || parsed.address || '',
            phone: prev.phone || parsed.phone || ''
          }));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [isOpen]);

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemove = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isFormValid = customer.name.trim() !== '' && customer.address.trim() !== '' && customer.phone.trim() !== '';

  const handleCheckout = async () => {
    if (cart.length === 0 || !isFormValid) return;

    // Save to Firebase
    const orderId = `order-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      customerData: customer,
      items: cart,
      totalPrice,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    try {
      await saveOrder(newOrder);
    } catch (e) {
      console.error('Error saving order', e);
    }

    // Save to local storage for future orders
    localStorage.setItem('customerData', JSON.stringify(customer));

    // Format WhatsApp message
    let text = `Halo Apotek Assyifa Farma Cideres, saya ingin memesan:\n\n`;
    text += `*Data Pelanggan:*\n`;
    text += `- Nama: ${customer.name}\n`;
    text += `- No HP: ${customer.phone}\n`;
    text += `- Alamat: ${customer.address}\n\n`;
    text += `*Detail Pesanan:*\n`;
    
    cart.forEach((item, index) => {
      const unitText = item.unit;
      const subTotal = item.price * item.quantity;
      text += `${index + 1}. *${item.name}*\n`;
      text += `   - Jumlah: ${item.quantity} ${unitText}\n`;
      text += `   - Harga per satuan: ${formatRupiah(item.price)}\n`;
      text += `   - Subtotal: ${formatRupiah(subTotal)}\n\n`;
    });

    text += `*Total Pembayaran: ${formatRupiah(totalPrice)}*\n\n`;
    text += `Apakah pesanan saya bisa diproses? Terima kasih.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');

    // Clear cart and form after checkout
    setCart([]);
    setCustomer({ name: '', address: '', phone: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl z-[9999] flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">Keranjang Belanja</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{totalItemCount} item terpilih</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 mb-6">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                    <User size={16} className="text-blue-500" /> Data Pemesan
                  </h3>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Lengkap</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={14} className="text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">No WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={14} className="text-slate-400" />
                      </div>
                      <input 
                        type="tel" 
                        value={customer.phone}
                        onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Alamat Pengiriman / Penjemputan</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                        <MapPin size={14} className="text-slate-400" />
                      </div>
                      <textarea 
                        value={customer.address}
                        onChange={(e) => setCustomer({...customer, address: e.target.value})}
                        rows={2}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
                        placeholder="Alamat lengkap..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                  <ShoppingCart size={48} className="text-slate-400" />
                  <p className="text-sm font-semibold text-slate-500">Keranjang masih kosong</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                    <div className="pr-8">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{item.name}</h3>
                      <div className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 dark:bg-slate-700 inline-block px-2 py-0.5 rounded mb-2">
                        {item.category}
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 font-black text-base mb-3">
                        {formatRupiah(item.price)} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">/ {item.unit}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Subtotal: <span className="text-slate-800 dark:text-slate-100">{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              setCart(prev => prev.map(c => c.id === item.id ? { ...c, quantity: Math.max(1, val) } : c));
                            } else if (e.target.value === '') {
                              // allow temporary empty state while typing
                              setCart(prev => prev.map(c => c.id === item.id ? { ...c, quantity: '' as any } : c));
                            }
                          }}
                          onBlur={(e) => {
                            if (!item.quantity) {
                              setCart(prev => prev.map(c => c.id === item.id ? { ...c, quantity: 1 } : c));
                            }
                          }}
                          className="w-10 text-center font-black text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 p-0 hide-arrows"
                        />
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-400 rounded transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-600 dark:text-slate-400">Total Harga</span>
                <span className="font-black text-2xl text-slate-800 dark:text-slate-100">{formatRupiah(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 text-white shadow-green-500/30"
              >
                <MessageCircle size={20} />
                Checkout via WhatsApp
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
