import os

with open('src/types.ts', 'r') as f:
    code = f.read()

code = code.replace("export interface Settings {", "export interface Settings {\n  autoDeleteOrders?: '1_week' | '2_weeks' | '1_month' | 'disabled';")

with open('src/types.ts', 'w') as f:
    f.write(code)
