import { useState } from 'react';
import { MainLayout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { NewProjectDialog } from './components/ProjectList/NewProjectDialog';
import { useAppStore, type SavedProject } from './store';

function App() {
  const [showProjectList, setShowProjectList] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const { setProject, createNewProject } = useAppStore();

  const handleSelectProject = (savedProject: SavedProject) => {
    setProject(savedProject.project);
    setShowProjectList(false);
  };

  const handleCreateNew = () => {
    setShowNewProjectDialog(true);
  };

  const handleConfirmNewProject = (projectName: string) => {
    createNewProject(projectName);
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
      <>
        <ProjectList onSelectProject={handleSelectProject} onCreateNew={handleCreateNew} />
        {showNewProjectDialog && (
          <NewProjectDialog onConfirm={handleConfirmNewProject} onCancel={handleCancelNewProject} />
        )}
      </>
    );
  }

  return <MainLayout onBackToProjectList={handleBackToProjectList} />;
}

export default App;
