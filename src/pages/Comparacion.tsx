import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function Comparacion() {
  const [resumenFile, setResumenFile] = useState<File | null>(null);
  const [externoFile, setExternoFile] = useState<File | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Comparación de Archivos Excel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card para el archivo de Resumen */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Archivo de Resumen</h2>
          <p className="text-gray-500 mb-4">
            Sube el archivo Excel exportado desde la página de "Resumen".
          </p>
          <div className="flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
            <input
              type="file"
              id="resumen-file-upload"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileChange(e, setResumenFile)}
            />
            <label
              htmlFor="resumen-file-upload"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Seleccionar archivo
            </label>
            {resumenFile && (
              <p className="mt-4 text-sm text-gray-600">
                Archivo seleccionado: <strong>{resumenFile.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Card para el archivo Externo */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Archivo Externo</h2>
          <p className="text-gray-500 mb-4">
            Sube el archivo Excel del recurso externo.
          </p>
          <div className="flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
            <input
              type="file"
              id="externo-file-upload"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileChange(e, setExternoFile)}
            />
            <label
              htmlFor="externo-file-upload"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Seleccionar archivo
            </label>
            {externoFile && (
              <p className="mt-4 text-sm text-gray-600">
                Archivo seleccionado: <strong>{externoFile.name}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {resumenFile && externoFile && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
            Comparar Archivos
          </button>
        </div>
      )}
    </div>
  );
}
