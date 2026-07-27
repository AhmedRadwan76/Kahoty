import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('عنصر التقرير غير موجود');
  }

  // Hide action buttons during canvas capture
  const actionButtons = element.querySelectorAll('.no-print');
  actionButtons.forEach((btn) => ((btn as HTMLElement).style.display = 'none'));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
  } finally {
    actionButtons.forEach((btn) => ((btn as HTMLElement).style.display = ''));
  }
}
