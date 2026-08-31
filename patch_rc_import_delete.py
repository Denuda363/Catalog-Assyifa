import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

code = code.replace("clearAllOrders,", "clearAllOrders,\n  deleteOrders,")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
