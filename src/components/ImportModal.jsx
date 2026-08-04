import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ImportModal({ open, onClose, type, onImported }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState('upload');
  const fileRef = useRef(null);

  const reset = () => {
    setFile(null);
    setParsedRows([]);
    setErrors([]);
    setResults(null);
    setStep('upload');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseStaffIdentification = (data) => {
    return data
      .filter((row) => row['S/N'] && (row['FirstName'] || row['LastName']))
      .map((row) => {
        const firstName = String(row['FirstName'] || '').trim();
        const lastName = String(row['LastName'] || '').trim();
        const fullName = [lastName, firstName].filter(Boolean).join(' ');
        const rawId = String(row['ID Number'] || '').replace(/\s/g, '').trim();
        return {
          teacherName: fullName,
          identityNumber: rawId,
          subject: '',
          phone: '',
        };
      });
  };

  const parseAttendanceFormat = (allSheets) => {
    const rows = [];
    for (const sheetName of Object.keys(allSheets)) {
      const className = sheetName.trim();
      const sheet = allSheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      for (const row of rawData) {
        if (!row || row.length < 3) continue;
        const no = row[0];
        if (no === 'NO' || no === undefined || no === null) continue;
        if (typeof no !== 'number' && isNaN(Number(no))) continue;
        const code = String(row[1] || '').trim();
        const name = String(row[2] || '').trim();
        if (!code || !name) continue;
        if (code === 'Code' || name === 'Names') continue;
        rows.push({
          nesaCode: code,
          studentName: name,
          class: className,
          phonenumber: '',
          level: className.startsWith('L3') ? 'level3' : className.startsWith('L4') ? 'level4' : className.startsWith('L5') ? 'level5' : '',
        });
      }
    }
    return rows;
  };

  const handleFile = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrors([]);
    setResults(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      if (type === 'students') {
        const allSheets = {};
        workbook.SheetNames.forEach((name) => {
          allSheets[name] = workbook.Sheets[name];
        });
        const firstSheetName = workbook.SheetNames[0];
        const firstSheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });
        const headerRow = firstSheetData.find((row) =>
          row && row.some((cell) => String(cell).includes('Code') || String(cell).includes('Names') || String(cell).includes('NESA'))
        );
        const isAttendance = headerRow && (
          headerRow.some((h) => String(h).includes('Code')) ||
          headerRow.some((h) => String(h).includes('Names'))
        );

        if (isAttendance && workbook.SheetNames.length > 1) {
          const parsed = parseAttendanceFormat(allSheets);
          setParsedRows(parsed);
        } else {
          const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
          const mapped = mapRows(jsonData, 'students');
          setParsedRows(mapped);
        }
      } else {
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const firstRow = jsonData[0] || {};
        const keys = Object.keys(firstRow);
        const isStaff = keys.includes('LastName') || keys.includes('FirstName') || keys.includes('ID Number');
        if (isStaff) {
          const mapped = parseStaffIdentification(jsonData);
          setParsedRows(mapped);
        } else {
          const mapped = mapRows(jsonData, 'teachers');
          setParsedRows(mapped);
        }
      }
      setStep('preview');
    } catch (err) {
      toast.error('Failed to parse file: ' + err.message);
    }
  };

  const mapRows = (jsonData, entityType) => {
    return jsonData.map((row) => {
      const keys = Object.keys(row);
      const find = (...candidates) => {
        for (const c of candidates) {
          const match = keys.find((k) => k.toLowerCase().trim() === c.toLowerCase());
          if (match) return String(row[match] || '').trim();
        }
        const partial = keys.find((k) => candidates.some((c) => k.toLowerCase().includes(c.toLowerCase())));
        return partial ? String(row[partial] || '').trim() : '';
      };
      if (entityType === 'students') {
        return {
          nesaCode: find('nesa code', 'code', 'nesacode'),
          studentName: find('name', 'names', 'student name', 'studentname', 'full name'),
          class: find('class', 'cls'),
          phonenumber: find('phone', 'phone number', 'phonenumber', 'tel'),
          level: find('level'),
        };
      } else {
        return {
          teacherName: find('name', 'teacher name', 'teachername', 'full name'),
          subject: find('subject'),
          identityNumber: find('national id', 'identity number', 'identitynumber', 'id number', 'id'),
          phone: find('phone', 'phone number', 'phonenumber', 'tel'),
        };
      }
    });
  };

  const validateRows = (rows) => {
    const valid = [];
    const invalid = [];
    rows.forEach((row, idx) => {
      if (type === 'students') {
        const code = String(row.nesaCode || '').trim();
        const name = String(row.studentName || '').trim();
        if (!code || !/^\d{12}$/.test(code)) {
          invalid.push({ row: idx + 1, data: row, error: 'NESA code must be exactly 12 digits' });
        } else if (!name) {
          invalid.push({ row: idx + 1, data: row, error: 'Student name is required' });
        } else {
          valid.push(row);
        }
      } else {
        const name = String(row.teacherName || '').trim();
        const subject = String(row.subject || '').trim();
        const id = String(row.identityNumber || '').replace(/\s/g, '');
        if (!name) {
          invalid.push({ row: idx + 1, data: row, error: 'Teacher name is required' });
        } else if (!id || !/^\d{16}$/.test(id)) {
          invalid.push({ row: idx + 1, data: row, error: 'National ID must be exactly 16 digits' });
        } else {
          row.identityNumber = id;
          valid.push(row);
        }
      }
    });
    return { valid, invalid };
  };

  const handleImport = async () => {
    const { valid, invalid } = validateRows(parsedRows);
    if (valid.length === 0) {
      setErrors(invalid);
      toast.error('No valid rows to import');
      return;
    }
    setImporting(true);
    try {
      const endpoint = type === 'students' ? '/students/import-bulk' : '/teachers/import-bulk';
      const payload = type === 'students' ? { students: valid } : { teachers: valid };
      const res = await api.post(endpoint, payload);
      const data = res.data;
      const allErrors = [...invalid, ...data.errors.map((e) => ({ row: e.row, data: {}, error: e.error }))];
      setErrors(allErrors);
      setResults({ imported: data.imported, total: valid.length + invalid.length, errorCount: allErrors.length });
      if (data.imported > 0) {
        toast.success(`Successfully imported ${data.imported} ${type}`);
        onImported?.();
      }
      if (allErrors.length > 0 && data.imported === 0) {
        toast.error(`${allErrors.length} rows had errors`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  const { valid, invalid } = parsedRows.length > 0 ? validateRows(parsedRows) : { valid: [], invalid: [] };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Import {type === 'students' ? 'Students' : 'Teachers'}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
        </div>

        {step === 'upload' && (
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
            >
              <FileSpreadsheet size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium">Click to select Excel or CSV file</p>
              <p className="text-gray-400 text-sm mt-1">Supports .xlsx, .xls, .csv</p>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

            {type === 'students' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-2">Expected columns (any order):</p>
                <p className="text-xs text-blue-600">NESA Code (12 digits), Name, Class, Phone, Level</p>
                <p className="text-xs text-blue-500 mt-1">Also supports multi-sheet attendance format (auto-detects class from sheet names)</p>
              </div>
            )}
            {type === 'teachers' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-2">Expected columns (any order):</p>
                <p className="text-xs text-blue-600">Name (or FirstName + LastName), Subject, National ID (16 digits), Phone</p>
                <p className="text-xs text-blue-500 mt-1">Also supports Staff Identification format (auto-combines FirstName + LastName, strips spaces from ID)</p>
              </div>
            )}
          </div>
        )}

        {step === 'preview' && !results && (
          <div>
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <FileSpreadsheet size={18} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file?.name}</p>
                <p className="text-xs text-gray-500">{parsedRows.length} rows found</p>
              </div>
            </div>

            {valid.length > 0 && (
              <div className="mb-3 p-3 bg-green-50 rounded-xl flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm text-green-700">{valid.length} valid rows ready to import</p>
              </div>
            )}

            {invalid.length > 0 && (
              <div className="mb-3 p-3 bg-amber-50 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600" />
                <p className="text-sm text-amber-700">{invalid.length} rows will be skipped (validation errors)</p>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {type === 'students' ? (
                      <>
                        <th className="text-left p-3 font-medium text-gray-600">Row</th>
                        <th className="text-left p-3 font-medium text-gray-600">NESA Code</th>
                        <th className="text-left p-3 font-medium text-gray-600">Name</th>
                        <th className="text-left p-3 font-medium text-gray-600">Class</th>
                        <th className="text-left p-3 font-medium text-gray-600">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left p-3 font-medium text-gray-600">Row</th>
                        <th className="text-left p-3 font-medium text-gray-600">Name</th>
                        <th className="text-left p-3 font-medium text-gray-600">Subject</th>
                        <th className="text-left p-3 font-medium text-gray-600">National ID</th>
                        <th className="text-left p-3 font-medium text-gray-600">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 100).map((row, idx) => {
                    const isInvalid = invalid.some((e) => e.row === idx + 1);
                    const err = invalid.find((e) => e.row === idx + 1);
                    return (
                      <tr key={idx} className={`border-t border-gray-100 ${isInvalid ? 'bg-red-50' : ''}`}>
                        {type === 'students' ? (
                          <>
                            <td className="p-3 text-gray-500">{idx + 1}</td>
                            <td className="p-3 font-mono text-gray-700">{row.nesaCode || '-'}</td>
                            <td className="p-3 text-gray-700">{row.studentName || '-'}</td>
                            <td className="p-3 text-gray-500">{row.class || '-'}</td>
                            <td className="p-3">
                              {isInvalid ? (
                                <span className="text-red-600 text-xs" title={err?.error}>{err?.error?.substring(0, 30)}</span>
                              ) : (
                                <span className="text-green-600">OK</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-gray-500">{idx + 1}</td>
                            <td className="p-3 text-gray-700">{row.teacherName || '-'}</td>
                            <td className="p-3 text-gray-500">{row.subject || '-'}</td>
                            <td className="p-3 font-mono text-gray-700">{row.identityNumber || '-'}</td>
                            <td className="p-3">
                              {isInvalid ? (
                                <span className="text-red-600 text-xs" title={err?.error}>{err?.error?.substring(0, 30)}</span>
                              ) : (
                                <span className="text-green-600">OK</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedRows.length > 100 && (
                <p className="text-center text-xs text-gray-400 p-2">Showing first 100 of {parsedRows.length} rows</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={importing || valid.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50"
              >
                <Upload size={16} />
                {importing ? 'Importing...' : `Import ${valid.length} ${type}`}
              </button>
              <button
                onClick={() => { reset(); setStep('upload'); }}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                Choose Another File
              </button>
            </div>
          </div>
        )}

        {results && (
          <div className="text-center py-6">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Import Complete</h3>
            <p className="text-gray-600">
              <span className="text-green-600 font-semibold">{results.imported}</span> {type} imported successfully
            </p>
            {results.errorCount > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                <span className="text-amber-600 font-semibold">{results.errorCount}</span> rows skipped due to errors
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { reset(); setStep('upload'); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                Import More
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
