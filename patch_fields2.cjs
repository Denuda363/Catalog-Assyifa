const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

const fieldsOld = `{/* Category selection */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kategori Obat / Golongan:</label>
                        <select
                          id="form-med-category"
                          value={medicineForm.category}
                          onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Obat Bebas">Obat Bebas</option>
                          <option value="Obat Bebas Terbatas">Obat Bebas Terbatas</option>
                          <option value="Obat Keras">Obat Keras</option>
                          <option value="Herbal & Suplemen">Herbal & Suplemen</option>
                          <option value="Alat Kesehatan">Alat Kesehatan</option>
                          <option value="Ibu & Anak">Ibu & Anak</option>
                        </select>
                      </div>`;

const fieldsNew = `{/* Category selection */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kategori Obat / Golongan:</label>
                        <select
                          id="form-med-category"
                          value={medicineForm.category}
                          onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Obat Bebas">Obat Bebas</option>
                          <option value="Obat Bebas Terbatas">Obat Bebas Terbatas</option>
                          <option value="Obat Keras">Obat Keras</option>
                          <option value="Herbal & Suplemen">Herbal & Suplemen</option>
                          <option value="Alat Kesehatan">Alat Kesehatan</option>
                          <option value="Ibu & Anak">Ibu & Anak</option>
                        </select>
                      </div>

                      {/* Product Group selection */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kelompok Obat:</label>
                        <select
                          id="form-med-product-group"
                          value={medicineForm.productGroup || ''}
                          onChange={(e) => setMedicineForm({...medicineForm, productGroup: e.target.value as any})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Pilih Kelompok --</option>
                          <option value="Paten">Paten</option>
                          <option value="Generik">Generik</option>
                        </select>
                      </div>

                      {/* Division selection */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Divisi Produk:</label>
                        <select
                          id="form-med-division"
                          value={medicineForm.division || ''}
                          onChange={(e) => setMedicineForm({...medicineForm, division: e.target.value})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Pilih Divisi --</option>
                          {(settings.divisions || []).map((div, i) => (
                            <option key={i} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>`;

code = code.replace(fieldsOld, fieldsNew);
fs.writeFileSync('src/components/RoomControl.tsx', code);
