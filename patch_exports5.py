import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

code = code.replace("""'Satuan Dasar': m.baseUnit || 'Lembar',""", """'Satuan Dasar': m.baseUnit || 'Lembar',
      'Satuan Tambahan': m.multiUnits && m.multiUnits.length > 0 ? m.multiUnits.map(u => `1 ${u.name} = ${u.multiplier} ${m.baseUnit || 'Lembar'}`).join(', ') : '-',""")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
