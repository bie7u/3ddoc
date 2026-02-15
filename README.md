# 3D Instruction Builder

A frontend-only web application for creating step-by-step interactive 3D instructions with a no-code node-based editor.

## Features

- **Node-based Step Editor**: Visual flow editor using React Flow to create and connect instruction steps
- **3D Viewer**: Real-time 3D model preview using React Three Fiber with smooth camera transitions
- **Step Properties Editor**: Edit step details including title, description, and highlight colors
- **Preview Mode**: Navigate through steps with smooth camera transitions and step-by-step guidance
- **Local Persistence**: Automatic saving to browser localStorage
- **Sample Project**: Includes example project with pre-configured steps

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Three Fiber** - 3D rendering with Three.js
- **React Flow** - Node-based visual editor
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bie7u/3ddoc.git
cd 3ddoc
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Main Interface

The application is divided into three main panels:

1. **Left Panel - Step Flow Editor**: 
   - Visualize and manage instruction steps as a node graph
   - Click and drag to create connections between steps
   - Click nodes to select and edit them

2. **Center Panel - 3D Viewer**: 
   - View the 3D model for the selected step
   - Rotate and zoom using mouse controls
   - See step title and description overlaid on the viewer

3. **Right Panel - Properties Editor**: 
   - Edit selected step properties
   - Change title, description, and highlight color
   - Add new steps or delete existing ones

### Creating Instructions

1. **Add a New Step**: Click "Add New Step" button in the properties panel
2. **Edit Step Details**: Select a step and modify its properties in the right panel
3. **Connect Steps**: Drag from one step node to create a connection to another
4. **Preview**: Click "Preview Mode" to see your instruction flow

### Preview Mode

- Navigate through steps using Previous/Next buttons
- Jump to any step using the step indicator dots
- Camera smoothly transitions between step viewpoints
- Exit preview to return to editing mode

### Data Persistence

- Your project is automatically saved to browser localStorage
- Click "Load Sample" to restore the example project

## Project Structure

```
src/
├── components/
│   ├── Layout/           # Main layout component
│   ├── StepBuilder/      # React Flow editor
│   ├── Viewer3D/         # Three.js 3D viewer
│   ├── StepProperties/   # Properties editor panel
│   └── PreviewMode/      # Preview navigation
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
├── utils/                # Utility functions and sample data
├── App.tsx               # Main app component
└── main.tsx              # Entry point
```

## Key Components

### State Management (Zustand)

The `useAppStore` hook manages:
- Project data (steps and connections)
- Selected step
- Preview mode state
- LocalStorage persistence

### 3D Viewer

- Uses React Three Fiber for rendering
- OrbitControls for camera manipulation
- Smooth camera transitions between steps
- Procedural geometry (box) for MVP

### Step Builder

- React Flow for node-based editing
- Custom step node component
- Edge connections for step flow
- Drag-and-drop interface

### Preview Mode

- Step-by-step navigation
- Camera animation
- Progress tracking
- Visual step indicators

## Future Enhancements

- Support for uploading custom GLB/GLTF models
- Annotation system with 3D markers
- Export project as JSON
- Import project from file
- Multiple model support per step
- Camera position editor with visual preview
- Undo/redo functionality
- Keyboard shortcuts
- Multi-project management

## License

MIT

## Author

Created as a prototype for a no-code 3D instruction builder.
