import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const doc = new jsPDF();
autoTable(doc, {
  head: [['Name', 'Image']],
  body: [
    ['Test', { content: '', image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }]
  ],
  didDrawCell: (data) => {
    if (data.row.section === 'body' && data.column.index === 1) {
      if (data.cell.raw.image) {
        doc.addImage(data.cell.raw.image, data.cell.x + 2, data.cell.y + 2, 10, 10);
      }
    }
  }
});
doc.save('test.pdf');
