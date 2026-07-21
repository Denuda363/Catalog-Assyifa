const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf-8');

code = code.replace(
  "const intervalMinutes = settings.autoRotateInterval || 1;\n    const intervalMs = intervalMinutes * 60 * 1000;",
  "const intervalValue = settings.autoRotateInterval || 1;\n    const isSeconds = settings.autoRotateUnit === 'seconds';\n    const intervalMs = isSeconds ? intervalValue * 1000 : intervalValue * 60 * 1000;"
);

code = code.replace(
  "[settings?.autoRotateTheme, settings?.autoRotateInterval, defaultTheme]",
  "[settings?.autoRotateTheme, settings?.autoRotateInterval, settings?.autoRotateUnit, defaultTheme]"
);

fs.writeFileSync('src/components/HomeView.tsx', code);
console.log("Patched HomeView.tsx");
