const fs = require('fs');
let code = fs.readFileSync('src/firebaseUtils.ts', 'utf-8');

const newFunc = `export async function deleteOrders(orderIds: string[]) {
  for(let i=0; i < orderIds.length; i+=490) {
      const chunk = orderIds.slice(i, i+490);
      const batch = writeBatch(db);
      chunk.forEach(id => batch.delete(doc(db, 'orders', id)));
      await batch.commit();
  }
}`;

code = code.replace("export async function clearAllOrders() {", newFunc + "\n\nexport async function clearAllOrders() {");
fs.writeFileSync('src/firebaseUtils.ts', code);
