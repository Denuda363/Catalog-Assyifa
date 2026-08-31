const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

code = code.replace("firebaseInitializeData,", "firebaseInitializeData,\n  clearAllOrders,");
fs.writeFileSync('src/components/RoomControl.tsx', code);
