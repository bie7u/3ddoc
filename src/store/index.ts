import { create } from 'zustand';
import type { Edge } from 'reactflow';
import type { InstructionStep, ProjectData } from '../types';

interface AppStore {
  // Project data
  project: ProjectData | null;
  
  // Selected step
  selectedStepId: string | null;
  
  // Preview mode
  isPreviewMode: boolean;
  currentPreviewStepIndex: number;
  
  // Actions
  setProject: (project: ProjectData) => void;
  addStep: (step: InstructionStep) => void;
  updateStep: (id: string, updates: Partial<InstructionStep>) => void;
  deleteStep: (id: string) => void;
  setSelectedStepId: (id: string | null) => void;
  updateConnections: (edges: Edge[]) => void;
  setPreviewMode: (isPreview: boolean) => void;
  setCurrentPreviewStepIndex: (index: number) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  // Substep actions
  addSubstep: (parentId: string, substep: InstructionStep) => void;
  updateSubstep: (parentId: string, substepId: string, updates: Partial<InstructionStep>) => void;
  deleteSubstep: (parentId: string, substepId: string) => void;
}

const STORAGE_KEY = '3ddoc-project';

export const useAppStore = create<AppStore>((set, get) => ({
  project: null,
  selectedStepId: null,
  isPreviewMode: false,
  currentPreviewStepIndex: 0,

  setProject: (project) => {
    set({ project });
    get().saveToLocalStorage();
  },

  addStep: (step) => {
    const { project } = get();
    if (!project) return;
    
    const updatedProject = {
      ...project,
      steps: [...project.steps, step],
    };
    
    set({ project: updatedProject });
    get().saveToLocalStorage();
  },

  updateStep: (id, updates) => {
    const { project } = get();
    if (!project) return;
    
    const updatedProject = {
      ...project,
      steps: project.steps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      ),
    };
    
    set({ project: updatedProject });
    get().saveToLocalStorage();
  },

  deleteStep: (id) => {
    const { project } = get();
    if (!project) return;
    
    const updatedProject = {
      ...project,
      steps: project.steps.filter((step) => step.id !== id),
      connections: project.connections.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    };
    
    set({ 
      project: updatedProject,
      selectedStepId: get().selectedStepId === id ? null : get().selectedStepId
    });
    get().saveToLocalStorage();
  },

  setSelectedStepId: (id) => set({ selectedStepId: id }),

  updateConnections: (edges) => {
    const { project } = get();
    if (!project) return;
    
    const updatedProject = {
      ...project,
      connections: edges,
    };
    
    set({ project: updatedProject });
    get().saveToLocalStorage();
  },

  setPreviewMode: (isPreview) => {
    set({ isPreviewMode: isPreview });
    if (isPreview) {
      set({ currentPreviewStepIndex: 0 });
    }
  },

  setCurrentPreviewStepIndex: (index) => set({ currentPreviewStepIndex: index }),

  saveToLocalStorage: () => {
    const { project } = get();
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    }
  },

  loadFromLocalStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const project = JSON.parse(stored);
        set({ project });
      } catch (error) {
        console.error('Failed to load project from localStorage', error);
      }
    }
  },

  addSubstep: (parentId, substep) => {
    const { project } = get();
    if (!project) return;
    
    const updatedSteps = project.steps.map((step) => {
      if (step.id === parentId) {
        return {
          ...step,
          substeps: [...(step.substeps || []), { ...substep, parentId }],
        };
      }
      return step;
    });
    
    set({ project: { ...project, steps: updatedSteps } });
    get().saveToLocalStorage();
  },

  updateSubstep: (parentId, substepId, updates) => {
    const { project } = get();
    if (!project) return;
    
    const updatedSteps = project.steps.map((step) => {
      if (step.id === parentId && step.substeps) {
        return {
          ...step,
          substeps: step.substeps.map((substep) =>
            substep.id === substepId ? { ...substep, ...updates } : substep
          ),
        };
      }
      return step;
    });
    
    set({ project: { ...project, steps: updatedSteps } });
    get().saveToLocalStorage();
  },

  deleteSubstep: (parentId, substepId) => {
    const { project } = get();
    if (!project) return;
    
    const updatedSteps = project.steps.map((step) => {
      if (step.id === parentId && step.substeps) {
        return {
          ...step,
          substeps: step.substeps.filter((substep) => substep.id !== substepId),
        };
      }
      return step;
    });
    
    set({ 
      project: { ...project, steps: updatedSteps },
      selectedStepId: get().selectedStepId === substepId ? parentId : get().selectedStepId
    });
    get().saveToLocalStorage();
  },
}));
