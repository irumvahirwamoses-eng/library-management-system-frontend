import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const exportExcel = (rows, sheetName, filename) => {
  if (!rows || rows.length === 0) { toast.error('No data to export'); return; }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success(`${sheetName} exported to Excel`);
};

export const printTable = (title, columns, rows, schoolName = '') => {
  if (!rows || rows.length === 0) { toast.error('No data to print'); return; }
  const thead = `<tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr>`;
  const tbody = rows.map((r) => `<tr>${columns.map((c) => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('');
  const dateStr = new Date().toLocaleDateString();
  const win = window.open('', '_blank', 'width=1000,height=700');
  if (!win) { toast.error('Pop-up blocked. Allow pop-ups to print.'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:150px 24px 160px;color:#111;margin:0}
    .no-print{position:fixed;top:10px;right:16px;z-index:99;padding:10px 20px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-size:14px;cursor:pointer}
    .print-header{position:fixed;top:0;left:0;right:0;padding:16px 24px 8px;background:#fff;z-index:10}
    .print-header .brand{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #2563eb;padding-bottom:8px}
    .print-header h1{font-size:19px;color:#2563eb;margin:0;letter-spacing:.5px}
    .print-header .meta{font-size:12px;color:#555;text-align:right}
    .print-header h2{font-size:15px;margin:8px 0 0;color:#333}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
    th{background:#2563eb;color:#fff;text-align:left;padding:8px 10px;font-size:12px}
    td{border:1px solid #d1d5db;padding:7px 10px}
    tr:nth-child(even) td{background:#f5f7fb}
    .print-footer{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:8px 24px 14px;z-index:10}
    .print-footer .sigs{display:flex;justify-content:space-between;gap:24px;border-top:2px solid #2563eb;padding-top:10px}
    .print-footer .sig{flex:1;text-align:center}
    .print-footer .sig .space{height:38px}
    .print-footer .sig .line{border-top:1px solid #333;margin:0;padding-top:4px;font-size:11px;font-weight:600;color:#333}
    .print-dev{position:fixed;bottom:0;left:0;right:0;text-align:center;padding:6px 24px;font-size:11px;color:#888;z-index:10;background:#fff;border-top:1px solid #eee}
    @media print{ .no-print{display:none} }
  </style></head><body>
    <button class="no-print" onclick="window.print()">Print</button>
    <div class="print-header">
      <div class="brand">
        <h1>LIBRARY MANAGEMENT SYSTEM</h1>
        <div class="meta"><div>${schoolName || '&nbsp;'}</div><div>Date: ${dateStr}</div></div>
      </div>
      <h2>${title} <span style="font-weight:normal;color:#666">(${rows.length} record(s))</span></h2>
    </div>
    <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
    <div class="print-footer">
      <div class="sigs">
        <div class="sig"><div class="space"></div><p class="line">School Stamp</p></div>
        <div class="sig"><div class="space"></div><p class="line">Headmaster Signature</p></div>
        <div class="sig"><div class="space"></div><p class="line">Librarian Signature</p></div>
      </div>
    </div>
    <div class="print-dev">Developed by Irumva Hirwa Moses</div>
  </body></html>`);
  win.document.close();
  win.focus();
};
