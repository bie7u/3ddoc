import { useState } from 'react';
import { MainLayout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { NewProjectDialog } from './components/ProjectList/NewProjectDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore, type SavedProject } from './store';

function App() {
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

export default App;
