import { useState } from 'react';
import { MainLayout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { NewProjectDialog } from './components/ProjectList/NewProjectDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore, type SavedProject } from './store';

function App() {
  const [showProjectList, setShowProjectList] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const { setProject, createNewProject, setPreviewMode, setViewMode } = useAppStore();

  const handleSelectProject = (savedProject: SavedProject) => {
    setProject(savedProject.project, savedProject.nodePositions);
    setPreviewMode(true);
    setViewMode('view'); // Open in view-only mode when selecting from menu
    setShowProjectList(false);
  };

  const handleCreateNew = () => {
    setShowNewProjectDialog(true);
  };

  const handleConfirmNewProject = (projectName: string) => {
    createNewProject(projectName);
    setViewMode('edit'); // Open in edit mode when creating new project
    setShowNewProjectDialog(false);
    setShowProjectList(false);
  };

  const handleCancelNewProject = () => {
    setShowNewProjectDialog(false);
  };

  const handleBackToProjectList = () => {
    setShowProjectList(true);
  };

  if (showProjectList) {
    return (
      <ErrorBoundary>
        <ProjectList onSelectProject={handleSelectProject} onCreateNew={handleCreateNew} />
        {showNewProjectDialog && (
          <NewProjectDialog onConfirm={handleConfirmNewProject} onCancel={handleCancelNewProject} />
        )}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout onBackToProjectList={handleBackToProjectList} useSampleProjectFallback={false} />
    </ErrorBoundary>
  );
}

export default App;
