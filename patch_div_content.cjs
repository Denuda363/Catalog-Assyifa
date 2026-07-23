const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

const divStateOld = `const [importJson, setImportJson] = useState('');`;
const divStateNew = `const [importJson, setImportJson] = useState('');
  const [newDivision, setNewDivision] = useState('');
  const [editingDivisionIndex, setEditingDivisionIndex] = useState<number | null>(null);
  const [editingDivisionName, setEditingDivisionName] = useState('');

  const handleSaveDivision = async () => {
    if (!newDivision.trim()) return;
    const currentDivisions = settings.divisions || [];
    if (currentDivisions.includes(newDivision.trim())) {
      alert('Divisi sudah ada');
      return;
    }
    const updatedSettings = { ...settings, divisions: [...currentDivisions, newDivision.trim()] };
    await saveSettingsObj(updatedSettings);
    await addLogObj('Tambah Divisi', \`Divisi "\${newDivision.trim()}" ditambahkan\`);
    setNewDivision('');
  };

  const handleUpdateDivision = async () => {
    if (editingDivisionIndex === null || !editingDivisionName.trim()) return;
    const currentDivisions = [...(settings.divisions || [])];
    const oldName = currentDivisions[editingDivisionIndex];
    if (currentDivisions.some((d, i) => i !== editingDivisionIndex && d === editingDivisionName.trim())) {
      alert('Divisi dengan nama ini sudah ada');
      return;
    }
    currentDivisions[editingDivisionIndex] = editingDivisionName.trim();
    const updatedSettings = { ...settings, divisions: currentDivisions };
    await saveSettingsObj(updatedSettings);
    await addLogObj('Edit Divisi', \`Divisi "\${oldName}" diubah menjadi "\${editingDivisionName.trim()}"\`);
    setEditingDivisionIndex(null);
    setEditingDivisionName('');
  };

  const handleDeleteDivision = async (index: number) => {
    if (!confirm('Hapus divisi ini?')) return;
    const currentDivisions = [...(settings.divisions || [])];
    const divName = currentDivisions[index];
    currentDivisions.splice(index, 1);
    const updatedSettings = { ...settings, divisions: currentDivisions };
    await saveSettingsObj(updatedSettings);
    await addLogObj('Hapus Divisi', \`Divisi "\${divName}" dihapus\`);
  };`;

code = code.replace(divStateOld, divStateNew);

const contentDiv = `{activeTab === 'settings' && (`;

const divisionContent = `
{activeTab === 'divisions' && (
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-b-xl shadow-xs min-h-[60vh]">
              <div className="max-w-2xl mx-auto space-y-6">
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-xs">
                  <h3 className="font-bold text-blue-900 text-sm mb-3">Manajemen Divisi Obat</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama divisi baru..."
                      value={newDivision}
                      onChange={(e) => setNewDivision(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSaveDivision}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                    >
                      Tambah Divisi
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm">Daftar Divisi Saat Ini</h4>
                  {(settings.divisions || []).length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4 bg-slate-50 rounded-lg border border-slate-100">Belum ada divisi yang ditambahkan.</p>
                  ) : (
                    <ul className="space-y-2">
                      {(settings.divisions || []).map((div, index) => (
                        <li key={index} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                          {editingDivisionIndex === index ? (
                            <div className="flex items-center gap-2 flex-1 mr-4">
                              <input
                                type="text"
                                value={editingDivisionName}
                                onChange={(e) => setEditingDivisionName(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button onClick={handleUpdateDivision} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs shrink-0">Simpan</button>
                              <button onClick={() => setEditingDivisionIndex(null)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs shrink-0">Batal</button>
                            </div>
                          ) : (
                            <>
                              <span className="font-semibold text-slate-800 text-sm">{div}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingDivisionIndex(index); setEditingDivisionName(div); }}
                                  className="px-2.5 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDivision(index)}
                                  className="px-2.5 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded text-xs"
                                >
                                  Hapus
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (`;

code = code.replace(contentDiv, divisionContent);

fs.writeFileSync('src/components/RoomControl.tsx', code);
