import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Eye, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { UploadedPDF } from '../types';

interface ProposalUploaderProps {
  files: UploadedPDF[];
  onAddFiles: (newFiles: UploadedPDF[]) => void;
  onRemoveFile: (id: string) => void;
  onPreviewFile: (file: UploadedPDF) => void;
}

export const ProposalUploader: React.FC<ProposalUploaderProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onPreviewFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileObjects = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const validPdfs: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validPdfs.push(file);
      } else {
        setErrorMessage(`"${file.name}" no es un archivo PDF válido.`);
      }
    }

    if (validPdfs.length === 0) return;

    const remainingSlots = 3 - files.length;
    if (remainingSlots <= 0) {
      setErrorMessage('Ya has alcanzado el límite máximo de 3 propuestas.');
      return;
    }

    const filesToProcess = validPdfs.slice(0, remainingSlots);
    if (validPdfs.length > remainingSlots) {
      setErrorMessage(`Solo se agregaron ${remainingSlots} propuestas (máximo permitido: 3).`);
    }

    const newUploaded: UploadedPDF[] = [];

    for (const file of filesToProcess) {
      const base64 = await readFileAsBase64(file);
      newUploaded.push({
        id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        base64,
      });
    }

    onAddFiles(newUploaded);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileObjects(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileObjects(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Propuestas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sube de 1 a 3 archivos PDF de cotizaciones (una propuesta por aseguradora).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
          <span>{files.length}</span>
          <span className="text-slate-400">/</span>
          <span>3 propuestas</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drop Zone */}
      {files.length < 3 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-teal-600 bg-teal-50/50'
              : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-teal-50 text-teal-900 rounded-full">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Haz clic para seleccionar o arrastra los archivos PDF aquí
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatos permitidos: .PDF (máx. 3 archivos en total)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Has cargado las 3 propuestas permitidas. Puedes visualizarlas o remover alguna si deseas cambiarla.</span>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Archivos cargados ({files.length}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="group relative flex flex-col justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-900">
                        Propuesta {String.fromCharCode(65 + idx)}
                      </span>
                    </div>
                    <p
                      className="text-xs sm:text-sm font-semibold text-slate-800 truncate mt-1"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => onPreviewFile(file)}
                    className="inline-flex items-center gap-1 text-xs text-teal-900 hover:text-teal-700 font-medium px-2 py-1 rounded-md hover:bg-teal-50 transition cursor-pointer"
                    title="Ver PDF en visor"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
