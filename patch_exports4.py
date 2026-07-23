import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

code = code.replace("'Dosis/Aturan': m.dose || '-',", "'Dosis/Aturan': m.dose || '-',\n      'Satuan Dasar': m.baseUnit || 'Lembar',")

code = code.replace("""const tableData = filteredMedicines.map(m => [
      m.name,
      m.category,
      m.productGroup || '-',
      m.division || '-',
      formatRupiah(m.priceMedis || m.price || 0),
      m.stockStatus || 'Tersedia'
    ]);""", """const tableData = filteredMedicines.map(m => [
      m.name,
      m.category,
      m.productGroup || '-',
      m.division || '-',
      m.baseUnit || 'Lembar',
      formatRupiah(m.priceMedis || m.price || 0),
      m.stockStatus || 'Tersedia'
    ]);""")

code = code.replace("""head: [['Nama Obat', 'Kategori', 'Kelompok', 'Divisi', 'Harga Medis', 'Status']],""", """head: [['Nama Obat', 'Kategori', 'Kelompok', 'Divisi', 'Satuan', 'Harga Medis', 'Status']],""")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
