const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');

const oldTab = `<Settings2 size={14} /> Aturan & PIN
            </button>
            <button
              id="admin-tab-orders"`;

const newTab = `<Settings2 size={14} /> Aturan & PIN
            </button>
            <button
              id="admin-tab-divisions"
              onClick={() => setActiveTab('divisions')}
              className={\`px-4 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 \${
                activeTab === 'divisions' 
                  ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg'
              }\`}
            >
              <Database size={14} /> Divisi Obat
            </button>
            <button
              id="admin-tab-orders"`;

code = code.replace(oldTab, newTab);

// add to allowed tabs type
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'medicines' | 'promos' | 'settings' | 'logs' | 'super' | 'orders'>('orders');",
  "const [activeTab, setActiveTab] = useState<'medicines' | 'promos' | 'settings' | 'logs' | 'super' | 'orders' | 'divisions'>('orders');"
);

fs.writeFileSync('src/components/RoomControl.tsx', code);
