export interface CsvProductItem {
  id: string;
  title: string;
  vendor: string;
  tags: string;
  hasDescription: boolean;
  descriptionHtml?: string;
}

export function exportCatalogToCsv(products: CsvProductItem[], filename?: string) {
  if (!products || products.length === 0) return;

  const escapeCsv = (val: string | boolean | undefined | null) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = ['Product ID', 'Title', 'Vendor', 'Tags', 'Description Status', 'Description Preview'];
  
  const rows = products.map(p => [
    escapeCsv(p.id),
    escapeCsv(p.title),
    escapeCsv(p.vendor),
    escapeCsv(p.tags),
    escapeCsv(p.hasDescription ? 'Enriched' : 'Missing Description'),
    escapeCsv(p.descriptionHtml ? p.descriptionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', filename || `shopify-catalog-inventory-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
