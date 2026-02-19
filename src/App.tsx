import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { NewProjectDialog } from './components/ProjectList/NewProjectDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore, type SavedProject } from './store';

// Component to handle direct project view via URL
function ProjectViewer() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setProject, getAllProjects, setPreviewMode, setViewMode } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const projects = getAllProjects();
      const foundProject = projects.find(p => p.project.id === projectId);
      
      if (foundProject) {
        setProject(foundProject.project, foundProject.nodePositions);
        setViewMode('view');
        setPreviewMode(true);
        setIsLoading(false);
      } else {
        setError('Project not found');
        setIsLoading(false);
      }
    }
  }, [projectId, getAllProjects, setProject, setPreviewMode, setViewMode]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Go to Project List
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout 
        onBackToProjectList={() => navigate('/')}
        useSampleProjectFallback={false} 
      />
    </ErrorBoundary>
  );
}

// Main app component with project list
function ProjectListPage() {
  const [showProjectList, setShowProjectList] = useState(true);
  const [showEditorPanel, setShowEditorPanel] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const { setProject, createNewProject, setPreviewMode, setViewMode } = useAppStore();

  // Handle selecting project from MAIN list (viewer) - opens in Preview Mode
  const handleSelectProject = (savedProject: SavedProject) => {
    setProject(savedProject.project, savedProject.nodePositions);
    setViewMode('view');
    setPreviewMode(true); // Open directly in Preview Mode for viewing
    setShowProjectList(false);
    setShowEditorPanel(false);
  };

  // Handle selecting project from EDITOR PANEL - opens in Editor Mode
  const handleSelectProjectForEditing = (savedProject: SavedProject) => {
    setProject(savedProject.project, savedProject.nodePositions);
    setViewMode('edit'); // Open in editor mode
    setPreviewMode(false);
    setShowProjectList(false);
    setShowEditorPanel(false);
  };

  const handleCreateNew = () => {
    setShowNewProjectDialog(true);
  };

  const handleConfirmNewProject = (projectName: string) => {
    createNewProject(projectName);
    setViewMode('edit'); // Open in edit mode when creating new project
    setPreviewMode(false);
    setShowNewProjectDialog(false);
    setShowProjectList(false);
    setShowEditorPanel(false);
  };

  const handleCancelNewProject = () => {
    setShowNewProjectDialog(false);
  };

  const handleBackToProjectList = () => {
    setShowProjectList(true);
    setShowEditorPanel(false);
  };

  const handleGoToEditorPanel = () => {
    setShowEditorPanel(true);
    setShowProjectList(false);
  };

  const handleBackFromEditorPanel = () => {
    setShowProjectList(true);
    setShowEditorPanel(false);
  };

  // Show main project list (viewer mode)
  if (showProjectList) {
    return (
      <ErrorBoundary>
        <ProjectList 
          onSelectProject={handleSelectProject} 
          onCreateNew={handleCreateNew}
          onGoToEditorPanel={handleGoToEditorPanel}
          isEditorPanel={false}
        />
        {showNewProjectDialog && (
          <NewProjectDialog onConfirm={handleConfirmNewProject} onCancel={handleCancelNewProject} />
        )}
      </ErrorBoundary>
    );
  }

  // Show editor panel project list
  if (showEditorPanel) {
    return (
      <ErrorBoundary>
        <ProjectList 
          onSelectProject={handleSelectProjectForEditing} 
          onCreateNew={handleCreateNew}
          onBackToMainList={handleBackFromEditorPanel}
          isEditorPanel={true}
        />
        {showNewProjectDialog && (
          <NewProjectDialog onConfirm={handleConfirmNewProject} onCancel={handleCancelNewProject} />
        )}
      </ErrorBoundary>
    );
  }

  // Show the actual project (either in preview or editor mode)
  return (
    <ErrorBoundary>
      <MainLayout 
        onBackToProjectList={handleBackToProjectList}
        onGoToEditorPanel={handleGoToEditorPanel}
        useSampleProjectFallback={false} 
      />
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectListPage />} />
      <Route path="/view/:projectId" element={<ProjectViewer />} />
    </Routes>
  );
}

export default App;
