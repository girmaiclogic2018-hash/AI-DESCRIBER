import { jsPDF } from 'jspdf';

interface ExportPdfOptions {
  title: string;
  vendor: string;
  tags: string;
  htmlContent: string;
}

export function exportProductDescriptionPdf({
  title,
  vendor,
  tags,
  htmlContent,
}: ExportPdfOptions) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 45;

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, cursorY, contentWidth, 52, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AI Describer', margin + 16, cursorY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Product Content Specification & Record', margin + 16, cursorY + 40);

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Exported: ${dateStr}`, pageWidth - margin - 16, cursorY + 32, { align: 'right' });

  cursorY += 72;

  // Product Meta Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, cursorY, contentWidth, 75, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const truncatedTitle = doc.splitTextToSize(title || 'Untitled Product', contentWidth - 32);
  doc.text(truncatedTitle, margin + 16, cursorY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Brand / Vendor: ${vendor || 'N/A'}`, margin + 16, cursorY + 44);
  doc.text(`Tags: ${tags || 'None'}`, margin + 16, cursorY + 60);

  cursorY += 95;

  // Section Heading: Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('GENERATED PRODUCT DESCRIPTION', margin, cursorY);

  cursorY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 18;

  // Parse HTML content into structured elements
  if (typeof window !== 'undefined') {
    const parser = new DOMParser();
    const docParsed = parser.parseFromString(htmlContent, 'text/html');
    const nodes = Array.from(docParsed.body.childNodes);

    for (const node of nodes) {
      if (cursorY > pageHeight - 70) {
        doc.addPage();
        cursorY = 40;
      }

      const tagName = node.nodeName.toLowerCase();
      if (tagName === 'p') {
        const text = node.textContent?.trim();
        if (text) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85); // slate-700
          const lines = doc.splitTextToSize(text, contentWidth);
          doc.text(lines, margin, cursorY);
          cursorY += lines.length * 15 + 10;
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        const items = (node as HTMLElement).querySelectorAll('li');
        items.forEach((li) => {
          if (cursorY > pageHeight - 70) {
            doc.addPage();
            cursorY = 40;
          }
          const text = li.textContent?.trim();
          if (text) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text('•', margin + 6, cursorY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            const lines = doc.splitTextToSize(text, contentWidth - 24);
            doc.text(lines, margin + 20, cursorY);
            cursorY += lines.length * 14 + 6;
          }
        });
        cursorY += 8;
      }
    }
  } else {
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
    const lines = doc.splitTextToSize(plainText, contentWidth);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 14 + 10;
  }

  // Raw HTML Code Block Preview
  if (cursorY > pageHeight - 140) {
    doc.addPage();
    cursorY = 40;
  }

  cursorY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Semantic HTML Code (Shopify Direct Paste)', margin, cursorY);
  cursorY += 10;

  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);

  const htmlLines = doc.splitTextToSize(htmlContent, contentWidth - 24);
  const visibleLines = htmlLines.slice(0, 10);
  const blockHeight = visibleLines.length * 12 + 18;
  doc.roundedRect(margin, cursorY, contentWidth, blockHeight, 3, 3, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(visibleLines, margin + 12, cursorY + 16);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'AI Describer · Autonomous 24/7 Shopify AI Product Description Engine',
      pageWidth / 2,
      pageHeight - 24,
      { align: 'center' }
    );
  }

  const cleanFileName = (title || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  doc.save(`${cleanFileName || 'product'}-description.pdf`);
}

interface ExportLicenseOptions {
  productName: string;
  orderId: string;
  licenseKey: string;
  date: string;
  status: string;
}

export function exportLicenseCertificatePdf({
  productName,
  orderId,
  licenseKey,
  date,
  status,
}: ExportLicenseOptions) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 45;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, cursorY, contentWidth, 65, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AI DESCRIBER SHOPIFY APPLET', margin + 20, cursorY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Official Digital License Certificate & Proof of Purchase', margin + 20, cursorY + 45);

  const issueDateStr = date === 'Today, Just Now' ? new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : date;
  doc.text(`Issued: ${issueDateStr}`, pageWidth - margin - 20, cursorY + 35, { align: 'right' });

  cursorY += 95;

  // Certificate Frame decoration
  doc.setDrawColor(79, 70, 229); // Indigo line
  doc.setLineWidth(2);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 25;

  // Certificate Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139); // slate-505
  doc.text('This document certifies that the purchaser listed below has acquired a genuine license for:', margin, cursorY);
  cursorY += 24;

  // Product Name Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(productName, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 20 + 20;

  // Box with metadata
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.roundedRect(margin, cursorY, contentWidth, 110, 6, 6, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);

  // Col 1: Order details
  doc.text('Order reference:', margin + 20, cursorY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(orderId, margin + 20, cursorY + 40);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Current State:', margin + 20, cursorY + 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(status === 'Active' ? 16 : 180, status === 'Active' ? 124 : 100, status === 'Active' ? 65 : 10); // green vs amber
  doc.text(status, margin + 20, cursorY + 85);

  // Col 2: License key
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Product Activation License Key:', margin + 220, cursorY + 25);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(licenseKey, margin + 220, cursorY + 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Integration Type:', margin + 220, cursorY + 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Shopify Direct Payments Gateway', margin + 220, cursorY + 85);

  cursorY += 140;

  // Verification & Activation instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('HOW TO ACTIVATE IN YOUR SHOPIFY STORE:', margin, cursorY);
  cursorY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const instructions = [
    '1. Log in to your Shopify Admin Dashboard.',
    '2. Open the "AI Describer Shopify Applet" from your apps selection.',
    '3. Navigate to the App Settings page, paste your License Key shown above, and click Save.',
    '4. Your 24/7 background automation pipeline and automated sync features will activate immediately.',
    '5. For enterprise packages, priority server queues are auto-allocated based on this license key.'
  ];

  instructions.forEach(inst => {
    const lines = doc.splitTextToSize(inst, contentWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 15 + 6;
  });

  // Footer / Signature block
  cursorY = pageHeight - 120;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 25;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('This is an automatically generated, digitally signed license certificate issued by AI Describer.', margin, cursorY);
  doc.text('Any unauthorized distribution of this license key is strictly prohibited and subject to account suspension.', margin, cursorY + 12);

  // Signatures / Brand watermark
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIED DIGITAL LICENSE', pageWidth - margin, cursorY + 10, { align: 'right' });

  doc.save(`${orderId}-license-certificate.pdf`);
}
