import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

if "import jsPDF from 'jspdf';" not in code:
    code = code.replace("import * as XLSX from 'xlsx';", "import * as XLSX from 'xlsx';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';")

functionsToAdd = """
  const handleExportMedicinesExcel = () => {
    if (medicines.length === 0) {
      alert("Tidak ada data obat untuk diekspor");
      return;
    }
    
    const data = medicines.map(m => ({
      'ID': m.id,
      'Nama Obat': m.name,
      'Kategori/Golongan': m.category,
      'Kelompok': m.productGroup || '-',
      'Divisi': m.division || '-',
      'Kandungan Aktif': m.activeIngredient || '-',
      'Indikasi': m.indication || '-',
      'Dosis/Aturan': m.dose || '-',
      'Harga Medis': m.priceMedis || m.price || 0,
      'Harga MB': m.priceMb || 0,
      'Harga Khusus': m.priceKhusus || 0,
      'Harga HK OTC': m.priceHkOtc || 0,
      'Status': m.stockStatus || 'Tersedia'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Obat");
    XLSX.writeFile(wb, `Data_Obat_Assyifa_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    addLogObj('Export Excel', 'Mengekspor data obat ke format Excel').catch(console.error);
  };

  const handleExportMedicinesPdf = () => {
    if (medicines.length === 0) {
      alert("Tidak ada data obat untuk diekspor");
      return;
    }
    
    const doc = new jsPDF();
    doc.text("Data Obat Apotek Assyifa", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    const tableData = medicines.map(m => [
      m.name,
      m.category,
      m.productGroup || '-',
      m.division || '-',
      formatRupiah(m.priceMedis || m.price || 0),
      m.stockStatus || 'Tersedia'
    ]);
    
    autoTable(doc, {
      startY: 28,
      head: [['Nama Obat', 'Kategori', 'Kelompok', 'Divisi', 'Harga Medis', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`Data_Obat_Assyifa_${new Date().toISOString().slice(0, 10)}.pdf`);
    addLogObj('Export PDF', 'Mengekspor data obat ke format PDF').catch(console.error);
  };
"""

insertionPoint = "const processJsonImportData"
if "handleExportMedicinesExcel" not in code:
    code = code.replace(insertionPoint, functionsToAdd + "\n  " + insertionPoint)

uiOld = """<div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">DATABASE APOTEK ASSYIFA ({medicines.length} Terdaftar)</h3>
                    <p className="text-xs text-slate-400">Tambahkan obat baru atau edit harga katalog obat secara langsung di bawah ini.</p>
                  </div>
                  {!isAddingMedicine && !editingMedicine && (
                    <button
                      id="add-medicine-btn"
                      onClick={() => { setIsAddingMedicine(true); resetMedicineForm(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/10"
                    >
                      <Plus size={14} /> Tambah Obat Baru
                    </button>
                  )}
                </div>"""

uiNew = """<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">DATABASE APOTEK ASSYIFA ({medicines.length} Terdaftar)</h3>
                    <p className="text-xs text-slate-400">Tambahkan obat baru atau edit harga katalog obat secara langsung di bawah ini.</p>
                  </div>
                  {!isAddingMedicine && !editingMedicine && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleExportMedicinesExcel}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                        title="Export ke Excel"
                      >
                        <Download size={14} /> Excel
                      </button>
                      <button
                        onClick={handleExportMedicinesPdf}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                        title="Export ke PDF"
                      >
                        <FileText size={14} /> PDF
                      </button>
                      <button
                        id="add-medicine-btn"
                        onClick={() => { setIsAddingMedicine(true); resetMedicineForm(); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/10"
                      >
                        <Plus size={14} /> Tambah Obat Baru
                      </button>
                    </div>
                  )}
                </div>"""

code = code.replace(uiOld, uiNew)

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
