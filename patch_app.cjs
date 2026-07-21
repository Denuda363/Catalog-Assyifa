const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  "cart={cart}\n                setCart={setCart}\n              />",
  "cart={cart}\n                setCart={setCart}\n                isAdminVisible={isAdminVisible}\n              />"
);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
