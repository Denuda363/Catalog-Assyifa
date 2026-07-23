import os

with open('src/components/RoomControl.tsx', 'r') as f:
    code = f.read()

code = code.replace("""  const handleExportMedicinesExcel = () => {
    if (medicines.length === 0) {""", """  const handleExportMedicinesExcel = () => {
    if (filteredMedicines.length === 0) {""")

code = code.replace("""const data = medicines.map(m => ({""", """const data = filteredMedicines.map(m => ({""")

code = code.replace("""const handleExportMedicinesPdf = () => {
    if (medicines.length === 0) {""", """const handleExportMedicinesPdf = () => {
    if (filteredMedicines.length === 0) {""")

code = code.replace("""const tableData = medicines.map(m => [""", """const tableData = filteredMedicines.map(m => [""")

# Also let's double check if there are other places where I used medicines.length for export count
code = code.replace("""DATABASE APOTEK ASSYIFA ({medicines.length} Terdaftar)""", """DATABASE APOTEK ASSYIFA ({filteredMedicines.length} Terdaftar)""")

with open('src/components/RoomControl.tsx', 'w') as f:
    f.write(code)
