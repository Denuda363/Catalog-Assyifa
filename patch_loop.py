import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

# Add useRef to import if not there
if 'useRef' not in code:
    code = code.replace("useState,", "useState, useRef,")
elif 'useRef' not in code.split('import')[1].split('from')[0]:
    code = code.replace("useState,", "useState, useRef,")

# Find the effect
effect_old = """  // Auto delete old orders
  useEffect(() => {
    if (!settings.autoDeleteOrders || settings.autoDeleteOrders === 'disabled') return;
    if (orders.length === 0) return;

    const now = new Date().getTime();
    let retentionMs = 0;
    switch(settings.autoDeleteOrders) {
      case '1_week': retentionMs = 7 * 24 * 60 * 60 * 1000; break;
      case '2_weeks': retentionMs = 14 * 24 * 60 * 60 * 1000; break;
      case '1_month': retentionMs = 30 * 24 * 60 * 60 * 1000; break;
    }

    if (retentionMs > 0) {
      const ordersToDelete = orders.filter(o => now - new Date(o.timestamp).getTime() > retentionMs);
      if (ordersToDelete.length > 0) {
        const ids = ordersToDelete.map(o => o.id);
        deleteOrders(ids).then(() => {
          addLogObj('Auto Delete Order', `Berhasil menghapus otomatis ${ids.length} riwayat order lama.`).catch(console.error);
        }).catch(err => {
          console.error("Gagal menghapus order otomatis:", err);
        });
      }
    }
  }, [orders, settings.autoDeleteOrders]);"""

effect_new = """  // Track attempted deletions to prevent optimistic-update infinite loops on quota errors
  const attemptedDeletions = useRef<Set<string>>(new Set());

  // Auto delete old orders
  useEffect(() => {
    if (!settings.autoDeleteOrders || settings.autoDeleteOrders === 'disabled') return;
    if (orders.length === 0) return;

    const now = new Date().getTime();
    let retentionMs = 0;
    switch(settings.autoDeleteOrders) {
      case '1_week': retentionMs = 7 * 24 * 60 * 60 * 1000; break;
      case '2_weeks': retentionMs = 14 * 24 * 60 * 60 * 1000; break;
      case '1_month': retentionMs = 30 * 24 * 60 * 60 * 1000; break;
    }

    if (retentionMs > 0) {
      const ordersToDelete = orders.filter(o => {
        if (attemptedDeletions.current.has(o.id)) return false;
        return (now - new Date(o.timestamp).getTime()) > retentionMs;
      });
      
      if (ordersToDelete.length > 0) {
        const ids = ordersToDelete.map(o => {
          attemptedDeletions.current.add(o.id);
          return o.id;
        });
        deleteOrders(ids).then(() => {
          addLogObj('Auto Delete Order', `Berhasil menghapus otomatis ${ids.length} riwayat order lama.`).catch(console.error);
        }).catch(err => {
          console.error("Gagal menghapus order otomatis (Mungkin karena Firebase Quota Exceeded):", err);
        });
      }
    }
  }, [orders, settings.autoDeleteOrders]);"""

code = code.replace(effect_old, effect_new)

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)

print("Patched!")
