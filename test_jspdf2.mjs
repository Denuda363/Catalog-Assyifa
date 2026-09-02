import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const doc = new jsPDF();
try {
  doc.addImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'PNG', 10, 10, 10, 10);
  console.log("With PNG format worked");
} catch(e) { console.error("Error with PNG", e); }

try {
  doc.addImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 20, 20, 10, 10);
  console.log("Without format worked");
} catch(e) { console.error("Error without format", e); }
