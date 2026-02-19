import { useState } from 'react';
import { useAppStore } from '../../store';
import { UploadedModelCanvas } from './UploadedModelCanvas';
import type { InstructionStep } from '../../types';

export const UploadModelEditor = () => {
  const { project, setPreviewMode, addStep, updateStep, deleteStep } = useAppStore();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<Partial<InstructionStep> | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);

  if (!project || !project.projectModelUrl) return null;

  const selectedStep = project.steps.find((s) => s.id === selectedStepId) ?? null;

  const handleAddStep = () => {
    setSelectedStepId(null);
    setEditingStep({ title: '', description: '', highlightColor: '#4299e1' });
    setIsAddingStep(true);
  };

  const handleEditStep = (step: InstructionStep) => {
    setSelectedStepId(step.id);
    setEditingStep({ title: step.title, description: step.description, highlightColor: step.highlightColor });
    setIsAddingStep(false);
  };

  const handleSaveStep = () => {
    if (!editingStep) return;
    if (isAddingStep) {
      const newStep: InstructionStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        title: editingStep.title || 'Nowy krok',
        description: editingStep.description || '',
        modelPath: '',
        cameraPosition: { x: 5, y: 5, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
        highlightColor: editingStep.highlightColor || '#4299e1',
        shapeType: 'custom',
        customModelUrl: project.projectModelUrl,
      };
      addStep(newStep);
      setSelectedStepId(newStep.id);
      setIsAddingStep(false);
      setEditingStep(null);
    } else if (selectedStepId) {
      updateStep(selectedStepId, {
        title: editingStep.title,
        description: editingStep.description,
        highlightColor: editingStep.highlightColor,
      });
      setEditingStep(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
    setIsAddingStep(false);
  };

  const handleDeleteStep = (stepId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten krok?')) {
      deleteStep(stepId);
      if (selectedStepId === stepId) {
        setSelectedStepId(null);
        setEditingStep(null);
      }
    }
  };

  const displayStep = selectedStep ?? project.steps[0] ?? null;

  return (
    <div className="w-full h-full flex overflow-hidden gap-1">
      {/* Center panel - 3D Model Viewer */}
      <div className="flex-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Podgląd modelu 3D</h2>
              <p className="text-xs text-slate-500">Załadowany model — obracaj kamerą swobodnie</p>
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          <UploadedModelCanvas
            modelUrl={project.projectModelUrl}
            stepTitle={displayStep?.title}
            stepDescription={displayStep?.description}
            stepIndex={displayStep ? project.steps.indexOf(displayStep) : undefined}
          />
        </div>
      </div>

      {/* Right panel - Step Management */}
      <div className="w-96 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">Kroki dokumentacji</h2>
                <p className="text-xs text-slate-500">{project.steps.length} kroków</p>
              </div>
            </div>
            <button
              onClick={() => setPreviewMode(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Add step button */}
          {!editingStep && (
            <button
              onClick={handleAddStep}
              className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group flex items-center gap-2 text-blue-500 group-hover:text-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Dodaj nowy krok</span>
            </button>
          )}

          {/* Editing / Adding form */}
          {editingStep && (
            <div className="border border-blue-300 rounded-lg p-4 bg-blue-50 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">
                {isAddingStep ? 'Nowy krok' : 'Edytuj krok'}
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tytuł</label>
                <input
                  type="text"
                  value={editingStep.title || ''}
                  onChange={(e) => setEditingStep((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tytuł kroku..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Opis</label>
                <textarea
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Opis kroku..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kolor wyróżnienia</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingStep.highlightColor || '#4299e1'}
                    onChange={(e) => setEditingStep((prev) => ({ ...prev, highlightColor: e.target.value }))}
                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-500">{editingStep.highlightColor || '#4299e1'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveStep}
                  disabled={!editingStep.title?.trim()}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Zapisz
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}

          {/* Steps list */}
          {project.steps.length === 0 && !editingStep && (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">Brak kroków</p>
              <p className="text-xs mt-1">Kliknij "Dodaj nowy krok" powyżej</p>
            </div>
          )}

          {project.steps.map((step, index) => (
            <div
              key={step.id}
              className={`group relative border rounded-lg p-3 cursor-pointer transition-all ${
                selectedStepId === step.id && !editingStep
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => {
                if (!editingStep) {
                  setSelectedStepId(step.id === selectedStepId ? null : step.id);
                }
              }}
            >
              <div className="flex items-start gap-3 pr-16">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: step.highlightColor ?? '#4299e1' }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{step.description}</p>
                  )}
                </div>
              </div>
              {/* Edit / Delete buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStep(step);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Edytuj krok"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStep(step.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  title="Usuń krok"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
