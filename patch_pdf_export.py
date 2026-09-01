import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

old_pdf_func = """  const handleExportMedicinesPdf = () => {
    if (filteredMedicines.length === 0) {
      alert("Tidak ada data obat untuk diekspor");
      return;
    }
    
    const doc = new jsPDF();
    doc.text("Data Obat Apotek Assyifa", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    const tableData = filteredMedicines.map(m => [
      m.name,
      m.category,
      m.activeIngredient || '-',
      m.baseUnit || 'Lembar',
      formatRupiah(m.priceMedis || m.price || 0)
    ]);
    
    autoTable(doc, {
      startY: 28,
      head: [['Nama Obat', 'Kategori', 'Komposisi Produk', 'Satuan', 'Harga Medis']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`Data_Obat_Assyifa_${new Date().toISOString().slice(0, 10)}.pdf`);
    addLogObj('Export PDF', 'Mengekspor data obat ke format PDF').catch(console.error);
  };"""

new_pdf_func = """  const handleExportMedicinesPdf = () => {
    if (filteredMedicines.length === 0) {
      alert("Tidak ada data obat untuk diekspor");
      return;
    }
    
    const doc = new jsPDF();
    doc.text("Data Obat Apotek Assyifa", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Sort by category first
    const sortedMedicines = [...filteredMedicines].sort((a, b) => a.category.localeCompare(b.category));
    
    const tableData: any[] = [];
    let currentCategory = '';
    
    sortedMedicines.forEach(m => {
      if (m.category !== currentCategory) {
        currentCategory = m.category;
        // Group header row
        tableData.push([{ content: currentCategory, colSpan: 4, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', textColor: [0, 0, 0] } }]);
      }
      tableData.push([
        m.name,
        m.activeIngredient || '-',
        m.baseUnit || 'Lembar',
        formatRupiah(m.priceMedis || m.price || 0)
      ]);
    });
    
    autoTable(doc, {
      startY: 28,
      head: [['Nama Obat', 'Komposisi Produk', 'Satuan', 'Harga Medis']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`Data_Obat_Assyifa_${new Date().toISOString().slice(0, 10)}.pdf`);
    addLogObj('Export PDF', 'Mengekspor data obat ke format PDF').catch(console.error);
  };"""

code = code.replace(old_pdf_func, new_pdf_func)

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
