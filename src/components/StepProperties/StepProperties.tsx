import { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import type { InstructionStep, ShapeType } from '../../types';

export const StepProperties = () => {
  const { project, selectedStepId, updateStep, deleteStep, addStep } = useAppStore();
  
  const selectedStep = project?.steps.find((step) => step.id === selectedStepId);
  
  const [formData, setFormData] = useState<Partial<InstructionStep>>({
    title: '',
    description: '',
    highlightColor: '#4299e1',
    shapeType: 'cube',
    customModelUrl: '',
  });

  useEffect(() => {
    if (selectedStep) {
      setFormData({
        title: selectedStep.title,
        description: selectedStep.description,
        highlightColor: selectedStep.highlightColor || '#4299e1',
        shapeType: selectedStep.shapeType || 'cube',
        customModelUrl: selectedStep.customModelUrl || '',
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
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Step',
      description: 'Add description here',
      modelPath: 'box',
      cameraPosition: { x: 5, y: 5, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#4299e1',
      shapeType: 'cube',
    };
    addStep(newStep);
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shape Type
              </label>
              <select
                value={formData.shapeType || 'cube'}
                onChange={(e) => handleInputChange('shapeType', e.target.value as ShapeType)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cube">Cube</option>
                <option value="sphere">Sphere</option>
                <option value="cylinder">Cylinder</option>
                <option value="cone">Cone</option>
                <option value="custom">Custom Model</option>
              </select>
            </div>

            {formData.shapeType === 'custom' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Model File
                  </label>
                  <input
                    type="file"
                    accept=".gltf,.glb"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        handleInputChange('customModelUrl', url);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Select a GLTF (.gltf) or GLB (.glb) 3D model file from your computer
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model URL
                  </label>
                  <input
                    type="text"
                    value={formData.customModelUrl || ''}
                    onChange={(e) => handleInputChange('customModelUrl', e.target.value)}
                    placeholder="https://example.com/model.glb"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Or enter a URL to a GLTF/GLB model file
                  </p>
                </div>
              </div>
            )}

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
