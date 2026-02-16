import { useEffect } from 'react';
import { useAppStore } from '../../store';
import { StepBuilder } from '../StepBuilder/StepBuilder';
import { Viewer3D } from '../Viewer3D/Viewer3D';
import { StepProperties } from '../StepProperties/StepProperties';
import { PreviewMode } from '../PreviewMode/PreviewMode';
import { sampleProject } from '../../utils/sampleData';

export const MainLayout = () => {
  const { 
    project, 
    selectedStepId, 
    isPreviewMode, 
    setPreviewMode, 
    setProject,
    loadFromLocalStorage,
    nodePositions,
    cameraMode,
    setCameraMode
  } = useAppStore();

  // Load project on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Set sample project if none loaded
  useEffect(() => {
    if (!project) {
      setProject(sampleProject);
    }
  }, [project, setProject]);

  const handleTogglePreview = () => {
    setPreviewMode(!isPreviewMode);
  };

  const handleToggleCameraMode = () => {
    setCameraMode(cameraMode === 'auto' ? 'free' : 'auto');
  };

  const handleLoadSample = () => {
    if (window.confirm('Load sample project? This will replace your current project.')) {
      setProject(sampleProject);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="w-screen h-screen">
        <PreviewMode />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="h-14 bg-gray-800 text-white flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">3D Instruction Builder</h1>
          {project && (
            <span className="text-sm text-gray-300">
              {project.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCameraMode}
            className={`px-4 py-2 rounded transition text-sm ${
              cameraMode === 'free' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {cameraMode === 'free' ? '📷 Free Camera' : '📷 Auto Camera'}
          </button>
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition text-sm"
          >
            Load Sample
          </button>
          <button
            onClick={handleTogglePreview}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
          >
            Preview Mode
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Step Builder (expanded) */}
        <div className="w-1/2 min-w-[400px] border-r border-gray-300 bg-white">
          <div className="h-full flex flex-col">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">Step Flow Editor</h2>
            </div>
            <div className="flex-1">
              <StepBuilder />
            </div>
          </div>
        </div>

        {/* Center Panel - 3D Viewer (reduced) */}
        <div className="w-1/3 relative">
          <div className="h-full">
            <Viewer3D project={project} currentStepId={selectedStepId} nodePositions={nodePositions} cameraMode={cameraMode} />
          </div>
          {!selectedStepId && project && project.steps.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-50 text-white px-6 py-4 rounded-lg">
                <p className="text-center">Select a step to highlight it in the 3D model</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Properties Editor */}
        <div className="w-80 bg-white">
          <div className="h-full flex flex-col">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">Properties</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <StepProperties />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
