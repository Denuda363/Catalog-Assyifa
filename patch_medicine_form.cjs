const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

const oldReset = `forceResetMedicineHistory({
      name: '',
      category: 'Obat Bebas',
      activeIngredient: '',
      price: 0,
      priceMb: 0,
      priceMedis: 0,
      pricePromo: 0,
      priceKhusus: 0,
      priceHkOtc: 0,
      image: '',
      indication: '',
      dose: '',
      isPromo: false,
      promoPrice: 0,
      baseUnit: 'Lembar',
      defaultUnit: '',
      multiUnits: []
    }, 'new');`;

const newReset = `forceResetMedicineHistory({
      name: '',
      category: 'Obat Bebas',
      productGroup: '',
      division: '',
      activeIngredient: '',
      price: 0,
      priceMb: 0,
      priceMedis: 0,
      pricePromo: 0,
      priceKhusus: 0,
      priceHkOtc: 0,
      image: '',
      indication: '',
      dose: '',
      isPromo: false,
      promoPrice: 0,
      baseUnit: 'Lembar',
      defaultUnit: '',
      multiUnits: []
    }, 'new');`;
    
code = code.replace(oldReset, newReset);

fs.writeFileSync('src/components/RoomControl.tsx', code);
