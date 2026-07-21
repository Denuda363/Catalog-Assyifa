const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

code = code.replace(
  "const [autoRotateInterval, setAutoRotateInterval] = useState(settings.autoRotateInterval || 1);",
  "const [autoRotateInterval, setAutoRotateInterval] = useState(settings.autoRotateInterval || 1);\n  const [autoRotateUnit, setAutoRotateUnit] = useState<'minutes' | 'seconds'>(settings.autoRotateUnit || 'minutes');"
);

code = code.replace(
  "if (settings.autoRotateInterval !== undefined) setAutoRotateInterval(settings.autoRotateInterval);",
  "if (settings.autoRotateInterval !== undefined) setAutoRotateInterval(settings.autoRotateInterval);\n    if (settings.autoRotateUnit !== undefined) setAutoRotateUnit(settings.autoRotateUnit);"
);

code = code.replace(
  "autoRotateTheme,\n      autoRotateInterval",
  "autoRotateTheme,\n      autoRotateInterval,\n      autoRotateUnit"
);

code = code.replace(
  "autoRotateTheme: parsed.settings.autoRotateTheme || false,\n      autoRotateInterval: parsed.settings.autoRotateInterval || 1",
  "autoRotateTheme: parsed.settings.autoRotateTheme || false,\n      autoRotateInterval: parsed.settings.autoRotateInterval || 1,\n      autoRotateUnit: parsed.settings.autoRotateUnit || 'minutes'"
);

const oldJSX = `{autoRotateTheme && (
                          <div className="mt-2 space-y-1">
                            <label className="text-[10px] text-slate-500">Interval Rotasi (Menit):</label>
                            <input
                              type="number"
                              min="1"
                              value={autoRotateInterval}
                              onChange={(e) => setAutoRotateInterval(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}`;

const newJSX = `{autoRotateTheme && (
                          <div className="mt-2 space-y-2">
                            <label className="text-[10px] text-slate-500">Interval Rotasi:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={autoRotateInterval}
                                onChange={(e) => setAutoRotateInterval(Number(e.target.value))}
                                className="w-1/2 px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <select
                                value={autoRotateUnit}
                                onChange={(e) => setAutoRotateUnit(e.target.value as 'minutes' | 'seconds')}
                                className="w-1/2 px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="minutes">Menit</option>
                                <option value="seconds">Detik</option>
                              </select>
                            </div>
                          </div>
                        )}`;

code = code.replace(oldJSX, newJSX);

fs.writeFileSync('src/components/RoomControl.tsx', code);
console.log("Patched RoomControl.tsx");
