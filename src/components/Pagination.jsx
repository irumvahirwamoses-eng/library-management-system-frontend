import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageList(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set([1, totalPages]);
  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push('...');
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pageList = getPageList(currentPage, totalPages);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>
        {pageList.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                p === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
