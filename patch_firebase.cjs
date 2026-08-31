const fs = require('fs');
let code = fs.readFileSync('src/firebaseUtils.ts', 'utf-8');

const newFunc = `export async function clearAllOrders() {
  const existing = await getDocs(collection(db, 'orders'));
  const docs = existing.docs;
  for(let i=0; i < docs.length; i+=490) {
      const chunk = docs.slice(i, i+490);
      const batch = writeBatch(db);
      chunk.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit();
  }
}`;

code = code.replace("export async function resetAllDataToDefault() {", newFunc + "\n\nexport async function resetAllDataToDefault() {");
fs.writeFileSync('src/firebaseUtils.ts', code);
