import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

code = code.replace("const [greetingPromo, setGreetingPromo] = useState(settings.greetingPromo || '');", "const [greetingPromo, setGreetingPromo] = useState(settings.greetingPromo || '');\n  const [autoDeleteOrders, setAutoDeleteOrders] = useState<'1_week' | '2_weeks' | '1_month' | 'disabled'>(settings.autoDeleteOrders || 'disabled');")

code = code.replace("setGreetingPromo(settings.greetingPromo || '');", "setGreetingPromo(settings.greetingPromo || '');\n    setAutoDeleteOrders(settings.autoDeleteOrders || 'disabled');")

code = code.replace("greetingPromo: greetingPromo,", "greetingPromo: greetingPromo,\n      autoDeleteOrders: autoDeleteOrders,")

code = code.replace("greetingPromo: parsed.settings.greetingPromo || '',", "greetingPromo: parsed.settings.greetingPromo || '',\n      autoDeleteOrders: parsed.settings.autoDeleteOrders || 'disabled',")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
