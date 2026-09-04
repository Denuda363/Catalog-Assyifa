import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

old_func = """  // Excel Template Downloader
  const handleDownloadExcelTemplate = () => {
    try {
      const headers = [
        'Nama Obat',
        'Kategori',
        'Kandungan Aktif',
        'Satuan Dasar',
        'Status Stok',
        'Harga Medis',
        'Harga MB',
        'Harga Promo',
        'Harga Khusus',
        'Harga HK OTC',
        'Satuan Tambahan 1',
        'Pengali 1',
        'Satuan Tambahan 2',
        'Pengali 2',
        'Indikasi',
        'Dosis',
        'Apakah Promo (Ya/Tidak)'
      ];
      
      const sampleData = [
        {
          'Nama Obat': 'Sanmol Tablet 500mg',
          'Kategori': 'Obat Bebas',
          'Kandungan Aktif': 'Paracetamol 500mg',
          'Satuan Dasar': 'Tablet',
          'Status Stok': 'Tersedia',
          'Harga Medis': 5000,
          'Harga MB': 4800,
          'Harga Promo': 4500,
          'Harga Khusus': 4200,
          'Harga HK OTC': 4000,
          'Satuan Tambahan 1': 'Strip',
          'Pengali 1': 10,
          'Satuan Tambahan 2': 'Box',
          'Pengali 2': 100,
          'Indikasi': 'Meredakan demam dan sakit kepala ringan.',
          'Dosis': 'Dewasa: 1-2 tablet sekali minum, 3-4 kali sehari.',
          'Apakah Promo (Ya/Tidak)': 'Tidak'
        },
        {
          'Nama Obat': 'Amoxisan 500mg Kapsul',
          'Kategori': 'Obat Keras',
          'Kandungan Aktif': 'Amoxicillin 500mg',
          'Satuan Dasar': 'Kapsul',
          'Status Stok': 'Tersedia',
          'Harga Medis': 15000,
          'Harga MB': 14000,
          'Harga Promo': 13000,
          'Harga Khusus': 12500,
          'Harga HK OTC': 12000,
          'Satuan Tambahan 1': 'Strip',
          'Pengali 1': 10,
          'Satuan Tambahan 2': '',
          'Pengali 2': '',
          'Indikasi': 'Infeksi bakteri pada pernapasan, uro-genital, kulit, dll.',
          'Dosis': 'Sesuai petunjuk dokter. Umumnya 1 kapsul setiap 8 jam.',
          'Apakah Promo (Ya/Tidak)': 'Tidak'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Obat');
      
      XLSX.writeFile(wb, 'Template_Impor_Obat_Assyifa.xlsx');
      addLogObj('Unduh Template', 'Berhasil mengunduh template Excel impor obat.').catch(console.error);
    } catch (err: any) {
      alert('Gagal mengunduh template: ' + err.message);
    }
  };"""

new_func = """  // Excel Template Downloader
  const handleDownloadExcelTemplate = () => {
    try {
      const headers = [
        'Nama Obat',
        'Kategori',
        'Kandungan Aktif',
        'Satuan Dasar',
        'Status Stok',
        'Harga',
        'Harga MB',
        'Harga Promo',
        'Harga Khusus',
        'Harga HK OTC',
        'Satuan Tambahan 1',
        'Pengali 1',
        'Satuan Tambahan 2',
        'Pengali 2',
        'Indikasi',
        'Dosis',
        'Apakah Promo (Ya/Tidak)'
      ];

      const includeData = window.confirm("Apakah Anda ingin menyertakan data obat yang ada saat ini ke dalam file Excel?\\n\\nKlik 'OK' untuk menyertakan data saat ini (bisa untuk backup atau edit massal).\\nKlik 'Batal' / 'Cancel' untuk mengunduh template kosong dengan contoh data.");
      
      let finalData: any[] = [];
      
      if (includeData && medicines.length > 0) {
        finalData = medicines.map(m => {
          let st1 = '';
          let p1 = '';
          let st2 = '';
          let p2 = '';
          
          if (m.conversionUnits && m.conversionUnits.length > 0) {
            st1 = m.conversionUnits[0].unit;
            p1 = String(m.conversionUnits[0].multiplier);
            if (m.conversionUnits.length > 1) {
              st2 = m.conversionUnits[1].unit;
              p2 = String(m.conversionUnits[1].multiplier);
            }
          }
          
          return {
            'Nama Obat': m.name,
            'Kategori': m.category,
            'Kandungan Aktif': m.activeIngredient || '',
            'Satuan Dasar': m.baseUnit || '',
            'Status Stok': m.stockStatus || 'Tersedia',
            'Harga': m.priceMedis || m.price || 0,
            'Harga MB': m.priceMB || 0,
            'Harga Promo': m.pricePromo || 0,
            'Harga Khusus': m.priceKhusus || 0,
            'Harga HK OTC': m.priceHKOTC || 0,
            'Satuan Tambahan 1': st1,
            'Pengali 1': p1,
            'Satuan Tambahan 2': st2,
            'Pengali 2': p2,
            'Indikasi': m.indications || '',
            'Dosis': m.dosage || '',
            'Apakah Promo (Ya/Tidak)': m.isPromo ? 'Ya' : 'Tidak'
          };
        });
      } else {
        finalData = [
          {
            'Nama Obat': 'Sanmol Tablet 500mg',
            'Kategori': 'Obat Bebas',
            'Kandungan Aktif': 'Paracetamol 500mg',
            'Satuan Dasar': 'Tablet',
            'Status Stok': 'Tersedia',
            'Harga': 5000,
            'Harga MB': 4800,
            'Harga Promo': 4500,
            'Harga Khusus': 4200,
            'Harga HK OTC': 4000,
            'Satuan Tambahan 1': 'Strip',
            'Pengali 1': 10,
            'Satuan Tambahan 2': 'Box',
            'Pengali 2': 100,
            'Indikasi': 'Meredakan demam dan sakit kepala ringan.',
            'Dosis': 'Dewasa: 1-2 tablet sekali minum, 3-4 kali sehari.',
            'Apakah Promo (Ya/Tidak)': 'Tidak'
          },
          {
            'Nama Obat': 'Amoxisan 500mg Kapsul',
            'Kategori': 'Obat Keras',
            'Kandungan Aktif': 'Amoxicillin 500mg',
            'Satuan Dasar': 'Kapsul',
            'Status Stok': 'Tersedia',
            'Harga': 15000,
            'Harga MB': 14000,
            'Harga Promo': 13000,
            'Harga Khusus': 12500,
            'Harga HK OTC': 12000,
            'Satuan Tambahan 1': 'Strip',
            'Pengali 1': 10,
            'Satuan Tambahan 2': '',
            'Pengali 2': '',
            'Indikasi': 'Infeksi bakteri pada pernapasan, uro-genital, kulit, dll.',
            'Dosis': 'Sesuai petunjuk dokter. Umumnya 1 kapsul setiap 8 jam.',
            'Apakah Promo (Ya/Tidak)': 'Tidak'
          }
        ];
      }

      const ws = XLSX.utils.json_to_sheet(finalData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Obat');
      
      XLSX.writeFile(wb, 'Template_Impor_Obat_Assyifa.xlsx');
      addLogObj('Unduh Template', 'Berhasil mengunduh template Excel impor obat.').catch(console.error);
    } catch (err: any) {
      alert('Gagal mengunduh template: ' + err.message);
    }
  };"""

if old_func in code:
    code = code.replace(old_func, new_func)
    print("Replaced successfully")
else:
    print("Function not found!")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
