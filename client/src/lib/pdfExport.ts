import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(
  htmlContent: string,
  fileName: string
): Promise<void> {
  try {
    // 创建临时容器
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm'; // A4 宽度
    tempDiv.style.padding = '20mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.color = '#2c2c2c';
    tempDiv.style.fontSize = '12pt';

    document.body.appendChild(tempDiv);

    // 转换为 canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 移除临时元素
    document.body.removeChild(tempDiv);

    // 创建 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210 - 40; // A4 宽度减去边距
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 20; // 上边距
    const pageHeight = 297 - 40; // A4 高度减去边距

    // 如果内容超过一页，分页处理
    if (imgHeight > pageHeight) {
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const canvasHeight = Math.min(
          remainingHeight,
          (pageHeight * canvas.height) / imgHeight
        );

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvasHeight;

        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            canvasHeight,
            0,
            0,
            canvas.width,
            canvasHeight
          );
        }

        const pageImgData = tempCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', 20, 20, imgWidth, pageHeight);

        remainingHeight -= pageHeight;
        sourceY += canvasHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    } else {
      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
    }

    // 保存 PDF
    pdf.save(fileName.replace('.md', '.pdf'));
  } catch (error) {
    console.error('PDF 导出失败:', error);
    throw new Error('PDF 导出失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
}
