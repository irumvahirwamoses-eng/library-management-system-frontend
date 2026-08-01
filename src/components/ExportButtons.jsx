import { Download, Printer } from 'lucide-react';

export default function ExportButtons({ onExcel, onPrint, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExcel}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-md font-medium text-xs disabled:opacity-50"
      >
        <Download size={14} /> Excel
      </button>
      <button
        onClick={onPrint}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl hover:from-gray-700 hover:to-gray-900 transition shadow-md font-medium text-xs disabled:opacity-50"
      >
        <Printer size={14} /> Print
      </button>
    </div>
  );
}
