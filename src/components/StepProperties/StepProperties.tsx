import { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import type { InstructionStep } from '../../types';

export const StepProperties = () => {
  const { project, selectedStepId, updateStep, deleteStep, addStep, nodePositions } = useAppStore();
  
  const selectedStep = project?.steps.find((step) => step.id === selectedStepId);
  
  const [formData, setFormData] = useState<Partial<InstructionStep>>({
    title: '',
    description: '',
    highlightColor: '#4299e1',
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
    };
    addStep(newStep);
  };

  const handleAddSideStep = (direction: 'left' | 'right') => {
    if (!selectedStepId) return;

    const newStep: InstructionStep = {
      id: `step-${Date.now()}`,
      title: `${direction === 'left' ? 'Left' : 'Right'} Step`,
      description: 'Add description here',
      modelPath: 'box',
      cameraPosition: { x: 5, y: 5, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#4299e1',
    };

    // Calculate position relative to selected step
    const selectedPosition = nodePositions[selectedStepId] || { x: 100, y: 100 };
    const offset = direction === 'left' ? -300 : 300;
    const newPosition = {
      x: selectedPosition.x + offset,
      y: selectedPosition.y,
    };

    addStep(newStep, newPosition);
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

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Add Side Steps</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSideStep('left')}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-sm"
                  >
                    ← Add Left Step
                  </button>
                  <button
                    onClick={() => handleAddSideStep('right')}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-sm"
                  >
                    Add Right Step →
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete Step
              </button>
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
