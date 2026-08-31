const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

const stateInsert = `  const [isResetting, setIsResetting] = useState(false);
  const [isResettingOrders, setIsResettingOrders] = useState(false);
  const [resetOrdersPin, setResetOrdersPin] = useState('');`;
code = code.replace("  const [isResetting, setIsResetting] = useState(false);", stateInsert);

const funcInsert = `  const handleResetOrders = async () => {
    if (resetOrdersPin !== settings.adminPin) {
      alert("Kode PIN salah!");
      return;
    }
    
    if (confirm("Apakah Anda yakin ingin MENGHAPUS SEMUA riwayat order? Tindakan ini tidak dapat dibatalkan!")) {
      try {
        await clearAllOrders();
        addLogObj('Hapus Riwayat Order', 'Riwayat order berhasil direset/dikosongkan.').catch(console.error);
        setIsResettingOrders(false);
        setResetOrdersPin('');
        alert("Riwayat order berhasil dihapus.");
      } catch (err) {
        alert("Gagal mereset order. Silakan coba lagi.");
        console.error(err);
      }
    }
  };

  const handleImportJson =`;
code = code.replace("  const handleImportJson =", funcInsert);

const uiOld = `                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">RIWAYAT ORDER</h3>
                    <p className="text-xs text-slate-400">Daftar order pesanan yang masuk melalui WhatsApp.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Cari nama, No HP, ID..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>`;

const uiNew = `                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">RIWAYAT ORDER</h3>
                    <p className="text-xs text-slate-400">Daftar order pesanan yang masuk melalui WhatsApp.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {isResettingOrders ? (
                      <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-lg border border-rose-200 w-full sm:w-auto">
                        <input
                          type="password"
                          placeholder="PIN Admin"
                          value={resetOrdersPin}
                          onChange={(e) => setResetOrdersPin(e.target.value)}
                          className="w-24 px-2 py-1 text-xs border border-rose-200 rounded outline-none focus:border-rose-400"
                        />
                        <button onClick={handleResetOrders} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                          Konfirmasi
                        </button>
                        <button onClick={() => { setIsResettingOrders(false); setResetOrdersPin(''); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-xs font-bold transition-colors">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsResettingOrders(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                        title="Reset Riwayat Order"
                      >
                        <Trash2 size={14} /> Reset Data
                      </button>
                    )}

                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        placeholder="Cari nama, No HP, ID..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    </div>
                  </div>
                </div>`;
code = code.replace(uiOld, uiNew);

fs.writeFileSync('src/components/RoomControl.tsx', code);
