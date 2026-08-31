import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

uiOld = """                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>"""

uiNew = """                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>

                  {/* Auto delete orders */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Trash2 size={13} className="text-blue-600" /> Hapus Otomatis Riwayat Order:
                    </label>
                    <select
                      id="settings-auto-delete-orders"
                      value={autoDeleteOrders}
                      onChange={(e) => setAutoDeleteOrders(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    >
                      <option value="disabled">Nonaktifkan (Simpan Semua)</option>
                      <option value="1_week">Lebih Lama Dari 1 Minggu</option>
                      <option value="2_weeks">Lebih Lama Dari 2 Minggu</option>
                      <option value="1_month">Lebih Lama Dari 1 Bulan</option>
                    </select>
                    <span className="text-[10px] text-slate-400 block">Riwayat order akan dihapus otomatis ketika Anda membuka halaman Control Room ini.</span>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>"""

code = code.replace(uiOld, uiNew)

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
