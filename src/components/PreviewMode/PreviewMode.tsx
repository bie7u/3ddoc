import { useAppStore } from '../../store';
import { Viewer3D } from '../Viewer3D/Viewer3D';

export const PreviewMode = () => {
  const { 
    project, 
    currentPreviewStepIndex, 
    setCurrentPreviewStepIndex,
    setPreviewMode 
  } = useAppStore();

  if (!project || project.steps.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No steps to preview</p>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Exit Preview
          </button>
        </div>
      </div>
    );
  }

  const currentStep = project.steps[currentPreviewStepIndex];
  const canGoPrevious = currentPreviewStepIndex > 0;
  const canGoNext = currentPreviewStepIndex < project.steps.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentPreviewStepIndex(currentPreviewStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentPreviewStepIndex(currentPreviewStepIndex + 1);
    }
  };

  const handleExit = () => {
    setPreviewMode(false);
  };

  return (
    <div className="w-full h-full relative">
      {/* 3D Viewer */}
      <Viewer3D step={currentStep} />

      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow-lg z-10"
      >
        Exit Preview
      </button>

      {/* Navigation controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg shadow-lg z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={`px-4 py-2 rounded ${
              canGoPrevious
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>

          <div className="text-center min-w-[120px]">
            <div className="text-sm text-gray-300">Step</div>
            <div className="text-lg font-bold">
              {currentPreviewStepIndex + 1} / {project.steps.length}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`px-4 py-2 rounded ${
              canGoNext
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Next →
          </button>
        </div>

        {/* Step selector */}
        <div className="mt-4 flex gap-2 justify-center">
          {project.steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentPreviewStepIndex(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentPreviewStepIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
              title={step.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
