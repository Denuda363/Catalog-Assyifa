import os

with open('src/App.tsx', 'r') as f:
    code = f.read()

import_old = "import CartModal from './components/CartModal';"
import_new = "import CartModal from './components/CartModal';\nimport { PWAInstallButton } from './components/PWAInstallButton';"

if import_old in code and 'PWAInstallButton' not in code:
    code = code.replace(import_old, import_new)

button_old = """          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dark mode toggle */}"""

button_new = """          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <PWAInstallButton />
            {/* Dark mode toggle */}"""

if button_old in code:
    code = code.replace(button_old, button_new)
    print("Patched App.tsx!")
else:
    print("Could not find button_old in App.tsx")

with open('src/App.tsx', 'w') as f:
    f.write(code)
