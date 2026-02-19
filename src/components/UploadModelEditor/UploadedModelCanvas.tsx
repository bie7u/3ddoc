import { Suspense, useEffect, useState, useRef, useMemo, Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Error boundary for model loading errors
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[2, 2, 2]} />
    <meshStandardMaterial color="#888888" wireframe />
  </mesh>
);

const ErrorFallback = () => (
  <mesh>
    <boxGeometry args={[2, 2, 2]} />
    <meshStandardMaterial color="#ff4444" opacity={0.7} transparent />
  </mesh>
);

interface ModelRendererProps {
  url: string;
}

const ModelRenderer = ({ url }: ModelRendererProps) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Auto-center the model
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
};

interface UploadedModelInnerProps {
  url: string;
}

const UploadedModelInner = ({ url }: UploadedModelInnerProps) => {
  const isDataUrl = url.startsWith('data:');
  // Only track the converted blob URL; for regular URLs use url directly
  const [convertedBlobUrl, setConvertedBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isDataUrl) return;
    let cancelled = false;
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        const newBlobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = newBlobUrl;
        setConvertedBlobUrl(newBlobUrl);
      })
      .catch((err) => console.error('Failed to convert data URL:', err));
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
        setConvertedBlobUrl(null);
      }
    };
  }, [url, isDataUrl]);

  const blobUrl = isDataUrl ? convertedBlobUrl : url;

  if (!blobUrl) return <LoadingFallback />;

  return (
    <ModelErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <ModelRenderer url={blobUrl} />
      </Suspense>
    </ModelErrorBoundary>
  );
};

interface UploadedModelCanvasProps {
  modelUrl: string;
  stepTitle?: string;
  stepDescription?: string;
  stepIndex?: number;
}

export const UploadedModelCanvas = ({
  modelUrl,
  stepTitle,
  stepDescription,
  stepIndex,
}: UploadedModelCanvasProps) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7.5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />
        <UploadedModelInner url={modelUrl} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        <gridHelper args={[20, 20]} />
      </Canvas>

      {/* Step overlay */}
      {stepTitle && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-5 py-4 rounded-xl shadow-2xl border border-white/10 max-w-sm">
          <div className="flex items-start gap-3">
            {stepIndex !== undefined && (
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-sm font-bold">{stepIndex + 1}</span>
              </div>
            )}
            <div>
              <h3 className="font-bold text-base mb-1">{stepTitle}</h3>
              {stepDescription && (
                <p className="text-sm text-slate-300 leading-relaxed">{stepDescription}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
