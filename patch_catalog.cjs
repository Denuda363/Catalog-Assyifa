const fs = require('fs');
let code = fs.readFileSync('src/components/CatalogView.tsx', 'utf-8');

// 1. Update CatalogViewProps
code = code.replace(
  "setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;\n}",
  "setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;\n  isAdminVisible?: boolean;\n}"
);

// 2. Update MedicineCardProps
code = code.replace(
  "setSelectedMedicine: (medicine: any) => void;\n}",
  "setSelectedMedicine: (medicine: any) => void;\n  showAllPrices?: boolean;\n}"
);

// 3. Update MedicineCard signature
code = code.replace(
  "function MedicineCard({ med, idx, getClassificationStyles, setSelectedMedicine }: MedicineCardProps) {",
  "function MedicineCard({ med, idx, getClassificationStyles, setSelectedMedicine, showAllPrices }: MedicineCardProps) {"
);

// 4. Update MedicineCard render with showAllPrices
const lowerDeckOld = `          {med.multiUnits && med.multiUnits.length > 0 && (
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">per {selectedUnit}</span>
          )}
        </div>`;
const lowerDeckNew = `          {med.multiUnits && med.multiUnits.length > 0 && (
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">per {selectedUnit}</span>
          )}
        </div>
        {showAllPrices && (
          <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-lg border border-slate-200 dark:border-slate-700 p-2 rounded-lg z-10 flex flex-col gap-1 text-[9px] font-bold min-w-24">
            <div className="flex justify-between items-center gap-2"><span className="text-slate-500">MB:</span> <span className="text-slate-800 dark:text-slate-200">{formatRupiah(((selectedUnitObj as any).customPriceMb !== undefined ? (selectedUnitObj as any).customPriceMb : (med.priceMb || 0) * multiplier))}</span></div>
            <div className="flex justify-between items-center gap-2"><span className="text-slate-500">Khusus:</span> <span className="text-slate-800 dark:text-slate-200">{formatRupiah(((selectedUnitObj as any).customPriceKhusus !== undefined ? (selectedUnitObj as any).customPriceKhusus : (med.priceKhusus || 0) * multiplier))}</span></div>
            <div className="flex justify-between items-center gap-2"><span className="text-slate-500">HK OTC:</span> <span className="text-slate-800 dark:text-slate-200">{formatRupiah(((selectedUnitObj as any).customPriceHkOtc !== undefined ? (selectedUnitObj as any).customPriceHkOtc : (med.priceHkOtc || 0) * multiplier))}</span></div>
          </div>
        )}`;
code = code.replace(lowerDeckOld, lowerDeckNew);

// 5. Update CatalogView signature and add state
code = code.replace(
  "export default function CatalogView({ medicines, settings, selectedMedicine, setSelectedMedicine, cart, setCart }: CatalogViewProps) {",
  "export default function CatalogView({ medicines, settings, selectedMedicine, setSelectedMedicine, cart, setCart, isAdminVisible }: CatalogViewProps) {\n  const [showAllPrices, setShowAllPrices] = useState(false);"
);

// 6. Add the toggle button in CatalogView UI if isAdminVisible
const toggleOld = `<div className="flex gap-2.5 sm:gap-4">`;
const toggleNew = `{isAdminVisible && (
            <div className="flex justify-end mb-2">
              <label className="flex items-center gap-2 cursor-pointer bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/40">
                <input type="checkbox" checked={showAllPrices} onChange={(e) => setShowAllPrices(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500 bg-white" />
                Tampilkan Semua Harga
              </label>
            </div>
          )}
          <div className="flex gap-2.5 sm:gap-4">`;
code = code.replace(toggleOld, toggleNew);

// 7. Pass showAllPrices to MedicineCard
code = code.replace(
  "<MedicineCard \n                  key={med.id}\n                  med={med}\n                  idx={idx}\n                  getClassificationStyles={getClassificationStyles}\n                  setSelectedMedicine={setSelectedMedicine}\n                />",
  "<MedicineCard \n                  key={med.id}\n                  med={med}\n                  idx={idx}\n                  getClassificationStyles={getClassificationStyles}\n                  setSelectedMedicine={setSelectedMedicine}\n                  showAllPrices={showAllPrices}\n                />"
);

// 8. Also update the detail modal if needed to show extra prices when showAllPrices is enabled
// I'll grep it to be safe, but let's see how much we can patch.
fs.writeFileSync('src/components/CatalogView.tsx', code);
console.log("Patched CatalogView.tsx");
