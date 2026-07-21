const fs = require('fs');
let code = fs.readFileSync('src/components/CatalogView.tsx', 'utf-8');

const extraPricesBlock = `
                    {showAllPrices && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-500 mb-1">Semua Harga ({selectedModalUnit || selectedMedicine.baseUnit || 'Lembar'})</div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Harga MB:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah((modalUnitInfo as any).customPriceMb !== undefined ? (modalUnitInfo as any).customPriceMb : (selectedMedicine.priceMb || 0) * modalUnitInfo.multiplier)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Harga Khusus:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah((modalUnitInfo as any).customPriceKhusus !== undefined ? (modalUnitInfo as any).customPriceKhusus : (selectedMedicine.priceKhusus || 0) * modalUnitInfo.multiplier)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Harga HK OTC:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah((modalUnitInfo as any).customPriceHkOtc !== undefined ? (modalUnitInfo as any).customPriceHkOtc : (selectedMedicine.priceHkOtc || 0) * modalUnitInfo.multiplier)}</span>
                        </div>
                      </div>
                    )}
`;

code = code.replace(
  "                    })()}\n                  </div>\n                </div>",
  "                    })()}\n" + extraPricesBlock + "                  </div>\n                </div>"
);

fs.writeFileSync('src/components/CatalogView.tsx', code);
console.log("Patched modal in CatalogView.tsx");
