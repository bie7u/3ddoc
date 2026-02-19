import { useState, useRef } from 'react';

interface NewProjectDialogProps {
  onConfirm: (projectName: string, projectType: 'builder' | 'upload', projectModelUrl?: string) => void;
  onCancel: () => void;
}

export const NewProjectDialog = ({ onConfirm, onCancel }: NewProjectDialogProps) => {
  const [step, setStep] = useState<'choose' | 'name'>('choose');
  const [projectType, setProjectType] = useState<'builder' | 'upload'>('builder');
  const [projectName, setProjectName] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelDataUrl, setModelDataUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChoosePath = (type: 'builder' | 'upload') => {
    setProjectType(type);
    setStep('name');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Rozmiar pliku przekracza limit 50MB. Wybierz mniejszy plik.');
      e.target.value = '';
      return;
    }

    if (!file.name.match(/\.(gltf|glb)$/i)) {
      alert('Nieprawidłowy typ pliku. Wybierz plik GLTF (.gltf) lub GLB (.glb).');
      e.target.value = '';
      return;
    }

    setIsLoadingFile(true);
    setModelFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setModelDataUrl(dataUrl);
      setIsLoadingFile(false);
    };
    reader.onerror = () => {
      alert('Nie udało się wczytać pliku. Spróbuj ponownie.');
      setIsLoadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    if (projectType === 'upload' && !modelDataUrl) {
      alert('Proszę wybrać plik modelu 3D.');
      return;
    }
    onConfirm(projectName.trim(), projectType, modelDataUrl ?? undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        {step === 'choose' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nowy projekt</h2>
            <p className="text-gray-500 mb-6">Wybierz sposób tworzenia projektu:</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Path 1 - Build 3D Model */}
              <button
                onClick={() => handleChoosePath('builder')}
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-700 mb-1">Zbuduj model 3D</h3>
                <p className="text-xs text-gray-500">Twórz model 3D od podstaw używając kształtów i kroków. Połącz je, by stworzyć interaktywną dokumentację.</p>
              </button>

              {/* Path 2 - Upload 3D Model */}
              <button
                onClick={() => handleChoosePath('upload')}
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 group-hover:text-green-700 mb-1">Wgraj własny model</h3>
                <p className="text-xs text-gray-500">Wgraj gotowy plik .glb lub .gltf i dodaj do niego opis oraz kroki dokumentacji.</p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Anuluj
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="mb-4 flex items-center gap-1 text-gray-500 hover:text-gray-700 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Wróć
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {projectType === 'builder' ? '🧱 Zbuduj model 3D' : '📤 Wgraj własny model'}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {projectType === 'builder'
                ? 'Utwórz projekt i zbuduj model 3D od podstaw.'
                : 'Wgraj plik modelu 3D i dodaj kroki dokumentacji.'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa projektu
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="np. Instrukcja montażu..."
                  autoFocus
                />
              </div>

              {projectType === 'upload' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plik modelu 3D{' '}
                    <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition"
                  >
                    {modelFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">{modelFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500">Kliknij, aby wybrać plik <strong>.glb</strong> lub <strong>.gltf</strong></p>
                        <p className="text-xs text-gray-400 mt-1">Maks. 50MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".gltf,.glb"
                    aria-required="true"
                    aria-label="Plik modelu 3D (wymagany)"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isLoadingFile && (
                    <p className="mt-2 text-sm text-blue-500">Ładowanie pliku...</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim() || (projectType === 'upload' && (!modelDataUrl || isLoadingFile))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Utwórz projekt
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
