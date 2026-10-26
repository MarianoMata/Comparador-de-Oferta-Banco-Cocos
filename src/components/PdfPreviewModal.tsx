import React from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { UploadedPDF } from '../types';

interface PdfPreviewModalProps {
  file: UploadedPDF | null;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  const pdfDataUrl = file.url || (file.base64?.startsWith('data:') ? file.base64 : `data:application/pdf;base64,${file.base64}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-red-100 text-red-600 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                Visualización de documento original de la propuesta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfDataUrl}
              download={file.name}
              className="p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-200 rounded-lg transition"
              title="Descargar archivo"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embed / Iframe */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4">
          <iframe
            src={`${pdfDataUrl}#toolbar=1`}
            title={file.name}
            className="w-full h-full rounded-xl border border-slate-300 shadow-inner bg-white"
          />
        </div>
      </div>
    </div>
  );
};
