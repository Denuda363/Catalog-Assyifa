import os

with open('tsconfig.json', 'r') as f:
    code = f.read()

old_str = """    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}"""

new_str = """    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["vite/client", "vite-plugin-pwa/client"]
  }
}"""

if old_str in code:
    code = code.replace(old_str, new_str)
    print("Patched tsconfig.json!")
else:
    print("Could not find old_str in tsconfig.json")

with open('tsconfig.json', 'w') as f:
    f.write(code)
