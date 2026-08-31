import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

effect = """  // Auto delete old orders
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

code = code.replace("  // Sync settings prop changes", effect + "\n\n  // Sync settings prop changes")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
