"use client";

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  Shape,
  Path,
  ExtrudeGeometry,
  MathUtils,
  PMREMGenerator,
  type Group,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type SceneProps = {
  paused: boolean;
  activeIndex: number;
  onFailure?: () => void;
};

type Pointer = { x: number; y: number };

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Portfolio 3D scene could not initialize:", error.message);
    }
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Studio({ onFailure }: { onFailure: () => void }) {
  const { gl, scene, invalidate } = useThree();

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const studio = new RoomEnvironment();
    const reflection = generator.fromScene(studio, 0.06);
    const previousEnvironment = scene.environment;
    scene.environment = reflection.texture;
    studio.dispose();
    generator.dispose();
    invalidate();

    const onContextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.environment = previousEnvironment;
      reflection.dispose();
    };
  }, [gl, scene, invalidate, onFailure]);

  return (
    <>
      <ambientLight intensity={0.32} />
      <hemisphereLight args={["#edffe0", "#102a25", 1.3]} />
      <directionalLight position={[-3, 5, 5]} color="#f7ffdd" intensity={3.2} />
      <directionalLight position={[4, 1, -2]} color="#d5f26d" intensity={2.5} />
      <pointLight position={[-3, -2, 2]} color="#c7dfc2" intensity={12} />
    </>
  );
}

function roundedPath<T extends Shape | Path>(path: T, w: number, h: number, r: number): T {
  const x=-w/2, y=-h/2;
  path.moveTo(x+r,y); path.lineTo(x+w-r,y); path.quadraticCurveTo(x+w,y,x+w,y+r);
  path.lineTo(x+w,y+h-r); path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  path.lineTo(x+r,y+h); path.quadraticCurveTo(x,y+h,x,y+h-r);
  path.lineTo(x,y+r); path.quadraticCurveTo(x,y,x+r,y); path.closePath();
  return path;
}

const origins = [[-0.64,0.39,0], [0.72,0.18,0.09], [0.03,-0.6,0.28]];
const turns:[number,number,number][] = [[0.22,-0.25,-0.26], [1.14,0.18,0.44], [0.12,1.12,-0.5]];
const finishes = ['#d5f26d','#e3e9df','#496b57'];

function Engine({paused,pointer,scroll,activeIndex}:{paused:boolean;pointer:RefObject<Pointer>;scroll:RefObject<number>;activeIndex:number}) {
  const sculpture=useRef<Group>(null);
  const time=useRef(0);
  const {invalidate}=useThree();
  const geometry=useMemo(()=>{
    const outline=roundedPath(new Shape(),2.7,2.2,.6);
    outline.holes.push(roundedPath(new Path(),1.8,1.3,.28));
    const geometry=new ExtrudeGeometry(outline,{depth:.22,steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:.065,bevelThickness:.065,curveSegments:16});
    geometry.translate(0,0,-.11);
    return geometry;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useEffect(()=>{
    if(paused && sculpture.current) {
      sculpture.current.children.forEach((band,i)=>band.scale.setScalar(i===activeIndex?1.055:1));
      invalidate();
    }
  },[paused,activeIndex,invalidate]);
  useFrame((_state,rawDelta)=>{
    if(paused||!sculpture.current) return;
    const delta=Math.min(rawDelta,.045); time.current+=delta;
    const progress=scroll.current;
    sculpture.current.rotation.x=MathUtils.damp(sculpture.current.rotation.x,-pointer.current.y*.13+Math.sin(time.current*.22)*.03,4,delta);
    sculpture.current.rotation.y=MathUtils.damp(sculpture.current.rotation.y,pointer.current.x*.2-.12+progress*.65,4,delta);
    sculpture.current.rotation.z=MathUtils.damp(sculpture.current.rotation.z,-progress*.15,4,delta);
    sculpture.current.children.forEach((band,i)=>{
      const [x,y,z]=origins[i];
      const spread=1.08-progress*.22;
      band.position.x=MathUtils.damp(band.position.x,x*spread,4,delta);
      band.position.y=MathUtils.damp(band.position.y,y*spread+Math.sin(time.current*.45+i)*.035,4,delta);
      band.position.z=z;
      const scale=MathUtils.damp(band.scale.x,i===activeIndex?1.055:1,5,delta);band.scale.setScalar(scale);
    });
  });
  return <group ref={sculpture} rotation={[0,-.12,0]} scale={1.03}>
    {origins.map(([x,y,z],i)=><group key={i} position={[x,y,z]} rotation={turns[i]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color={finishes[i]} roughness={i===2?.24:.2} metalness={i===0?.25:.65} clearcoat={.85} clearcoatRoughness={.15} envMapIntensity={1.1} emissive={i===activeIndex?'#748c32':'#000000'} emissiveIntensity={.055}/>
      </mesh>
    </group>)}
  </group>;
}

export default function Scene({ paused, activeIndex, onFailure }: SceneProps) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const host = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  useEffect(() => {
    if (paused) return;
    const update = () => {
      const hero = host.current?.closest('.hero');
      if (!hero) return;
      const bounds = hero.getBoundingClientRect();
      scroll.current = MathUtils.clamp(-bounds.top / bounds.height, 0, 1);
    };
    update();
    window.addEventListener('scroll', update, {passive:true});
    return () => window.removeEventListener('scroll', update);
  }, [paused]);
  const [failed, setFailed] = useState(false);
  const reportedFailure = useRef(false);
  const failureCallback = useRef(onFailure);
  failureCallback.current = onFailure;

  const handleFailure = useCallback(() => {
    if (reportedFailure.current) return;
    reportedFailure.current = true;
    setFailed(true);
    failureCallback.current?.();
  }, []);

  useEffect(() => {
    try {
      const probe=document.createElement('canvas');
      const context=probe.getContext('webgl2');
      if(!context) handleFailure();
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { handleFailure(); }
  },[handleFailure]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      data-scene-state={failed ? "unavailable" : paused ? "paused" : "active"}
      style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
      onPointerMove={(event) => {
        if (paused || event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      {!failed && (
        <SceneBoundary onFailure={handleFailure}>
          <Canvas
            camera={{ position: [0, 0, 8.2], fov: 38, near: 0.1, far: 40 }}
            dpr={[1, 1.5]}
            frameloop={paused ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            style={{ touchAction: "pan-y" }}
            fallback={<span>Your browser does not support the interactive 3D scene.</span>}
            onCreated={({ gl }) => {
              gl.setClearColor("#101913", 0);
              gl.toneMapping = ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.08;
            }}
          >
            <Studio onFailure={handleFailure} />
            <Engine paused={paused} pointer={pointer} scroll={scroll} activeIndex={activeIndex} />
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
