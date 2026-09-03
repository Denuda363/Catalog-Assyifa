import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

old_func = """  const handleExportMedicinesPdf = () => {
    if (filteredMedicines.length === 0) {
      alert("Tidak ada data obat untuk diekspor");
      return;
    }
    
    const includeImages = window.confirm("Apakah Anda ingin menyertakan gambar produk dalam PDF?\\n\\nKlik 'OK' untuk menyertakan gambar.\\nKlik 'Batal' / 'Cancel' untuk mengekspor tanpa gambar (ukuran file lebih kecil).");
    
    const doc = new jsPDF();
    doc.text("Data Obat Apotek Assyifa", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Sort by category first
    const sortedMedicines = [...filteredMedicines].sort((a, b) => a.category.localeCompare(b.category));
    
    const tableData: any[] = [];
    let currentCategory = '';
    
    const headRow = includeImages 
      ? ['Gambar', 'Nama Obat', 'Komposisi Produk', 'Satuan', 'Harga']
      : ['Nama Obat', 'Komposisi Produk', 'Satuan', 'Harga'];

    sortedMedicines.forEach(m => {
      if (m.category !== currentCategory) {
        currentCategory = m.category;
        // Group header row
        tableData.push([{ content: currentCategory, colSpan: includeImages ? 5 : 4, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', textColor: [0, 0, 0] } }]);
      }
      
      if (includeImages) {
        tableData.push([
          m.image ? { content: '', image: m.image } : '-',
          m.name,
          m.activeIngredient || '-',
          m.baseUnit || 'Lembar',
          formatRupiah(m.priceMedis || m.price || 0)
        ]);
      } else {
        tableData.push([
          m.name,
          m.activeIngredient || '-',
          m.baseUnit || 'Lembar',
          formatRupiah(m.priceMedis || m.price || 0)
        ]);
      }
    });
    
    autoTable(doc, {
      startY: 28,
      head: [headRow],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, valign: 'middle' },
      headStyles: { fillColor: [41, 128, 185] },
      bodyStyles: includeImages ? { minCellHeight: 16 } : {},
      didDrawCell: (data: any) => {
        if (includeImages && data.row.section === 'body' && data.column.index === 0) {
          const cellRaw = data.cell.raw;
          if (cellRaw && cellRaw.image) {
            try {
              let format = 'JPEG';
              if (cellRaw.image.startsWith('data:image/png')) format = 'PNG';
              else if (cellRaw.image.startsWith('data:image/webp')) format = 'WEBP';
              
              doc.addImage(cellRaw.image, format, data.cell.x + 2, data.cell.y + 2, 12, 12);
            } catch(e) {
              console.error(e);
            }
          }
        }
      }
    });
    
    doc.save(`Data_Obat_Assyifa_${new Date().toISOString().slice(0, 10)}.pdf`);
    addLogObj('Export PDF', 'Mengekspor data obat ke format PDF').catch(console.error);
  };"""

new_func = """  const handleExportMedicinesPdf = () => {
    if (filteredMedicines.length === 0) {
      alert("Tidak ada data obat untuk diekspor");
      return;
    }
    
    const includeImages = window.confirm("Apakah Anda ingin menyertakan gambar produk dalam PDF?\\n\\nKlik 'OK' untuk menyertakan gambar.\\nKlik 'Batal' / 'Cancel' untuk mengekspor tanpa gambar (ukuran file lebih kecil).");
    
    const doc = new jsPDF();
    doc.text("Data Obat Apotek Assyifa", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Sort by category first
    const sortedMedicines = [...filteredMedicines].sort((a, b) => a.category.localeCompare(b.category));
    
    const tableData: any[] = [];
    let currentCategory = '';
    
    const headRow = includeImages 
      ? ['Nama Obat', 'Gambar', 'Komposisi Produk', 'Satuan', 'Harga']
      : ['Nama Obat', 'Komposisi Produk', 'Satuan', 'Harga'];

    sortedMedicines.forEach(m => {
      if (m.category !== currentCategory) {
        currentCategory = m.category;
        // Group header row
        tableData.push([{ content: currentCategory, colSpan: includeImages ? 5 : 4, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', textColor: [0, 0, 0] } }]);
      }
      
      if (includeImages) {
        tableData.push([
          m.name,
          m.image ? { content: '', image: m.image } : '-',
          m.activeIngredient || '-',
          m.baseUnit || 'Lembar',
          formatRupiah(m.priceMedis || m.price || 0)
        ]);
      } else {
        tableData.push([
          m.name,
          m.activeIngredient || '-',
          m.baseUnit || 'Lembar',
          formatRupiah(m.priceMedis || m.price || 0)
        ]);
      }
    });
    
    autoTable(doc, {
      startY: 28,
      head: [headRow],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, valign: 'middle' },
      headStyles: { fillColor: [41, 128, 185] },
      bodyStyles: includeImages ? { minCellHeight: 16 } : {},
      didDrawCell: (data: any) => {
        if (includeImages && data.row.section === 'body' && data.column.index === 1) {
          const cellRaw = data.cell.raw;
          if (cellRaw && cellRaw.image) {
            try {
              let format = 'JPEG';
              if (cellRaw.image.startsWith('data:image/png')) format = 'PNG';
              else if (cellRaw.image.startsWith('data:image/webp')) format = 'WEBP';
              
              doc.addImage(cellRaw.image, format, data.cell.x + 2, data.cell.y + 2, 12, 12);
            } catch(e) {
              console.error(e);
            }
          }
        }
      }
    });
    
    doc.save(`Data_Obat_Assyifa_${new Date().toISOString().slice(0, 10)}.pdf`);
    addLogObj('Export PDF', 'Mengekspor data obat ke format PDF').catch(console.error);
  };"""

if old_func in code:
    code = code.replace(old_func, new_func)
    print("Replaced!")
else:
    print("Old function not found!")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
