import os

with open('vite.config.ts', 'r') as f:
    code = f.read()

# We need to add devOptions to VitePWA config
old_str = """        manifest: {
          name: 'Apotek Assyifa Farma',"""

new_str = """        devOptions: {
          enabled: true,
          type: 'module'
        },
        manifest: {"""

if old_str in code:
    code = code.replace(old_str, new_str)
    print("Patched vite.config.ts successfully!")
else:
    print("Could not find the target string in vite.config.ts")

with open('vite.config.ts', 'w') as f:
    f.write(code)
