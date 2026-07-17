import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, Plus, Minus, MessageCircle, User, MapPin, Phone, FileText, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem, Settings, Order, CustomerData } from '../types';
import { formatRupiah } from '../utils';
import { saveOrder } from '../firebaseUtils';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  settings: Settings;
  onNavigate: (tab: string) => void;
}

export default function CartModal({ isOpen, onClose, cart, setCart, settings, onNavigate }: CartModalProps) {
  const [isCustomerDataOpen, setIsCustomerDataOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    address: '',
    phone: '',
    notes: '',
    deliveryOption: 'dikirim'
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
            phone: prev.phone || parsed.phone || '',
            notes: prev.notes || parsed.notes || '',
            deliveryOption: parsed.deliveryOption || 'dikirim'
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

  const isFormValid = customer.name?.trim() !== '' && customer.phone?.trim() !== '' && (customer.deliveryOption === 'diambil' || (customer.address && customer.address.trim() !== ''));

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
    text += `- Nama: ${customer.name.trim() !== '' ? customer.name : 'Tidak disertakan'}\n`;
    text += `- No HP: ${customer.phone.trim() !== '' ? customer.phone : 'Tidak disertakan'}\n`;
    text += `- Metode: ${customer.deliveryOption === 'diambil' ? 'Diambil di Apotek' : 'Dikirim ke Alamat'}\n`;
    if (customer.deliveryOption === 'dikirim') {
      text += `- Alamat: ${customer.address}\n`;
    }
    if (customer.notes && customer.notes.trim() !== '') {
      text += `- Catatan: ${customer.notes}\n`;
    }
    text += `\n*Detail Pesanan:*\n`;
    
    cart.forEach((item, index) => {
      const unitText = item.unit;
      text += `${index + 1}. *${item.name}*\n`;
      text += `   - Jumlah: ${item.quantity} ${unitText}\n\n`;
    });

    text += `Apakah pesanan saya bisa diproses? Terima kasih.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');

    // Clear cart and form after checkout
    setCart([]);
    setCustomer({ name: '', address: '', phone: '', notes: '', deliveryOption: 'dikirim' });
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
            {/* Modern Header */}
            <div className="relative p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Keranjang</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{totalItemCount} item</span>
                      <span className="text-xs text-slate-500">Tersimpan</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-all hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col gap-3">
                  <button 
                    onClick={() => setIsCustomerDataOpen(!isCustomerDataOpen)}
                    className="flex items-center justify-between w-full font-bold text-sm text-slate-800 dark:text-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" /> 
                      Data Pemesan (Opsional)
                    </div>
                    {isCustomerDataOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {isCustomerDataOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 pt-2"
                      >
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Nama Lengkap</span>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {customer.name || <span className="text-slate-400 italic">Belum diisi</span>}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">No WhatsApp</span>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {customer.phone || <span className="text-slate-400 italic">Belum diisi</span>}
                            </div>
                          </div>

                          <AnimatePresence>
                            {customer.deliveryOption === 'dikirim' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 mt-3">Alamat Pengiriman</span>
                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {customer.address || <span className="text-slate-400 italic">Belum diisi</span>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate('profile');
                          }}
                          className="w-full py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          Ubah Data di Profil
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Metode Pengiriman</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setCustomer({ ...customer, deliveryOption: 'dikirim' });
                          setIsCustomerDataOpen(true);
                        }}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-colors ${
                          customer.deliveryOption === 'dikirim' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Truck size={16} />
                        Dikirim
                      </button>
                      <button
                        onClick={() => setCustomer({ ...customer, deliveryOption: 'diambil' })}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-colors ${
                          customer.deliveryOption === 'diambil' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Package size={16} />
                        Diambil
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Catatan (Opsional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                        <FileText size={14} className="text-slate-400" />
                      </div>
                      <textarea 
                        value={customer.notes}
                        onChange={(e) => setCustomer({...customer, notes: e.target.value})}
                        rows={2}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
                        placeholder="Tambahkan catatan untuk pesanan..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                    <ShoppingCart size={40} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Keranjang Kosong</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">Silahkan pilih produk dari katalog untuk ditambahkan.</p>
                  </div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all relative group flex flex-col">
                    <div className="flex gap-4">
                      {/* Left icon / placeholder */}
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700/50 shrink-0">
                        <Package size={24} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      
                      <div className="flex-1 pr-6">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 leading-snug">{item.name}</h3>
                        <div className="flex items-center flex-wrap gap-1.5 mb-2">
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wide">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-rose-600 dark:text-rose-400 font-black text-sm">
                          {formatRupiah(item.price)} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">/ {item.unit}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Subtotal: <span className="text-slate-800 dark:text-slate-200 ml-1 text-sm">{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
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
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-400">Total Harga</span>
                <span className="font-black text-2xl text-slate-800 dark:text-slate-100">{formatRupiah(totalPrice)}</span>
              </div>
              
              {!isFormValid && cart.length > 0 && (
                <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 text-[10px] font-bold p-2 rounded-lg text-center border border-rose-100 dark:border-rose-900/50">
                  Lengkapi Data Pemesan (Profil & Metode) untuk melanjutkan.
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !isFormValid}
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
