import { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import type { InstructionStep, SubStep } from '../../types';

export const StepProperties = () => {
  const { project, selectedStepId, updateStep, deleteStep, addStep, addSubStep, updateSubStep, deleteSubStep } = useAppStore();
  
  const selectedStep = project?.steps.find((step) => step.id === selectedStepId);
  
  const [formData, setFormData] = useState<Partial<InstructionStep>>({
    title: '',
    description: '',
    highlightColor: '#4299e1',
  });

  const [editingSubstepId, setEditingSubstepId] = useState<string | null>(null);
  const [substepFormData, setSubstepFormData] = useState<Partial<SubStep>>({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (selectedStep) {
      setFormData({
        title: selectedStep.title,
        description: selectedStep.description,
        highlightColor: selectedStep.highlightColor || '#4299e1',
      });
    }
  }, [selectedStep]);

  const handleInputChange = (
    field: keyof InstructionStep,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (selectedStepId && selectedStep) {
      updateStep(selectedStepId, formData);
    }
  };

  const handleDelete = () => {
    if (selectedStepId && window.confirm('Are you sure you want to delete this step?')) {
      deleteStep(selectedStepId);
    }
  };

  const handleAddNewStep = () => {
    const newStep: InstructionStep = {
      id: `step-${Date.now()}`,
      title: 'New Step',
      description: 'Add description here',
      modelPath: 'box',
      cameraPosition: { x: 5, y: 5, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#4299e1',
      substeps: [],
    };
    addStep(newStep);
  };

  const handleAddSubstep = () => {
    if (!selectedStepId) return;
    
    const newSubstep: SubStep = {
      id: `substep-${Date.now()}`,
      title: 'New Substep',
      description: 'Add substep description',
    };
    addSubStep(selectedStepId, newSubstep);
  };

  const handleEditSubstep = (substep: SubStep) => {
    setEditingSubstepId(substep.id);
    setSubstepFormData({
      title: substep.title,
      description: substep.description,
    });
  };

  const handleSaveSubstep = () => {
    if (!selectedStepId || !editingSubstepId) return;
    
    updateSubStep(selectedStepId, editingSubstepId, substepFormData);
    setEditingSubstepId(null);
    setSubstepFormData({ title: '', description: '' });
  };

  const handleCancelEditSubstep = () => {
    setEditingSubstepId(null);
    setSubstepFormData({ title: '', description: '' });
  };

  const handleDeleteSubstep = (substepId: string) => {
    if (!selectedStepId) return;
    if (window.confirm('Are you sure you want to delete this substep?')) {
      deleteSubStep(selectedStepId, substepId);
    }
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Step Properties</h2>
        
        {!selectedStep ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No step selected</p>
            <button
              onClick={handleAddNewStep}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Add New Step
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlight Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.highlightColor || '#4299e1'}
                  onChange={(e) => handleInputChange('highlightColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.highlightColor || '#4299e1'}
                  onChange={(e) => handleInputChange('highlightColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
              
              <button
                onClick={handleAddNewStep}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Add New Step
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete Step
              </button>
            </div>

            {/* Substeps Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Substeps</h3>
                <button
                  onClick={handleAddSubstep}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                >
                  + Add Substep
                </button>
              </div>
              
              {selectedStep.substeps && selectedStep.substeps.length > 0 ? (
                <div className="space-y-2">
                  {selectedStep.substeps.map((substep, index) => (
                    <div key={substep.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                      {editingSubstepId === substep.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={substepFormData.title || ''}
                            onChange={(e) => setSubstepFormData({ ...substepFormData, title: e.target.value })}
                            placeholder="Substep title"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <textarea
                            value={substepFormData.description || ''}
                            onChange={(e) => setSubstepFormData({ ...substepFormData, description: e.target.value })}
                            placeholder="Substep description"
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveSubstep}
                              className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditSubstep}
                              className="flex-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">
                                {index + 1}. {substep.title}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {substep.description}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => handleEditSubstep(substep)}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSubstep(substep.id)}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-3">No substeps added yet</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Step ID</h3>
              <p className="text-xs text-gray-500 font-mono">{selectedStep.id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
