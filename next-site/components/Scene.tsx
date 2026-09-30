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
  type MeshPhysicalMaterial,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type SceneProps = {
  paused: boolean;
  activeIndex: number;
  onFailure?: () => void;
  onReady?: () => void;
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
      <hemisphereLight args={["#E8F1F8", "#18222D", 1.3]} />
      <directionalLight position={[-3, 5, 5]} color="#F0F4F7" intensity={3.2} />
      <directionalLight position={[4, 1, -2]} color="#6E9FC7" intensity={2.5} />
      <pointLight position={[-3, -2, 2]} color="#B8C3CC" intensity={12} />
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
const finishes = ['#6E9FC7','#F0F4F7','#486B88'];
const settleThreshold = 0.0001;

function Engine({paused,pointer,activeIndex}:{paused:boolean;pointer:RefObject<Pointer>;activeIndex:number}) {
  const sculpture=useRef<Group>(null);
  const materials=useRef<Array<MeshPhysicalMaterial|null>>([]);
  const initialized=useRef(false);
  const previousActive=useRef(activeIndex);
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
    if(!sculpture.current) return;
    // A pause freezes the current pose; a new selection still responds instantly.
    if(!initialized.current || (paused && previousActive.current!==activeIndex)) {
      sculpture.current.children.forEach((band,i)=>{
        band.scale.setScalar(i===activeIndex?1.055:1);
        const material=materials.current[i];
        if(material) material.emissiveIntensity=i===activeIndex?.055:0;
      });
    }
    initialized.current=true;
    previousActive.current=activeIndex;
    invalidate();
  },[paused,activeIndex,invalidate]);
  useFrame((_state,rawDelta)=>{
    if(paused||!sculpture.current) return;
    const delta=Math.min(rawDelta,.045);
    let moving=false;
    const settle=(current:number,target:number,speed:number)=>{
      const next=MathUtils.damp(current,target,speed,delta);
      if(Math.abs(next-target)<=settleThreshold) return target;
      moving=true;
      return next;
    };
    sculpture.current.rotation.x=settle(sculpture.current.rotation.x,-pointer.current.y*.13,4);
    sculpture.current.rotation.y=settle(sculpture.current.rotation.y,pointer.current.x*.2-.12,4);
    sculpture.current.children.forEach((band,i)=>{
      band.scale.setScalar(settle(band.scale.x,i===activeIndex?1.055:1,5));
      const material=materials.current[i];
      if(material) material.emissiveIntensity=settle(material.emissiveIntensity,i===activeIndex?.055:0,5);
    });
    // Demand rendering stops completely once the requested view has settled.
    if(moving) invalidate();
  });
  return <group ref={sculpture} rotation={[0,-.12,0]} scale={0.94}>
    {origins.map(([x,y,z],i)=><group key={i} position={[x,y,z]} rotation={turns[i]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial ref={material=>{materials.current[i]=material}} color={finishes[i]} roughness={i===2?.24:.2} metalness={i===0?.25:.65} clearcoat={.85} clearcoatRoughness={.15} envMapIntensity={1.1} emissive="#486B88" emissiveIntensity={0}/>
      </mesh>
    </group>)}
  </group>;
}

function ReadySignal({onReady}:{onReady:()=>void}) {
  const {gl}=useThree();
  const frame=useRef<number|null>(null);
  const reported=useRef(false);
  useEffect(()=>()=>{if(frame.current!==null) cancelAnimationFrame(frame.current)},[]);
  useFrame(()=>{
    if(reported.current || frame.current!==null) return;
    // useFrame runs before drawing. Report readiness on the following frame,
    // after a real mesh draw, so the static artwork never disappears too early.
    frame.current=requestAnimationFrame(()=>{
      frame.current=null;
      if(gl.getContext().isContextLost() || gl.info.render.calls===0) return;
      reported.current=true;
      onReady();
    });
  });
  return null;
}

export default function Scene({ paused, activeIndex, onFailure, onReady }: SceneProps) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const requestFrame=useRef<()=>void>(()=>{});
  const finePointer=useRef(false);
  useEffect(() => {
    const media=matchMedia('(hover: hover) and (pointer: fine)');
    const update=()=>{
      finePointer.current=media.matches;
      if(!media.matches) {
        pointer.current={x:0,y:0};
        requestFrame.current();
      }
    };
    update();
    media.addEventListener('change',update);
    return()=>{media.removeEventListener('change',update);requestFrame.current=()=>{}};
  }, []);
  const [failed, setFailed] = useState(false);
  const reportedFailure = useRef(false);
  const reportedReady = useRef(false);
  const failureCallback = useRef(onFailure);
  const readyCallback = useRef(onReady);
  failureCallback.current = onFailure;
  readyCallback.current = onReady;

  const handleReady=useCallback(()=>{
    if(reportedReady.current || reportedFailure.current) return;
    reportedReady.current=true;
    readyCallback.current?.();
  },[]);

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
      aria-hidden="true"
      data-scene-state={failed ? "unavailable" : paused ? "paused" : "active"}
      style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
      onPointerMove={(event) => {
        if (paused || !finePointer.current || event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if(!bounds.width || !bounds.height) return;
        pointer.current.x = MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1,-1,1);
        pointer.current.y = MathUtils.clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1,-1,1);
        requestFrame.current();
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
        if(!paused) requestFrame.current();
      }}
    >
      {!failed && (
        <SceneBoundary onFailure={handleFailure}>
          <Canvas
            camera={{ position: [0, 0, 8.2], fov: 38, near: 0.1, far: 40 }}
            dpr={[1, 1.5]}
            frameloop="demand"
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            style={{ touchAction: "pan-y" }}
            fallback={<span>Your browser does not support the interactive 3D scene.</span>}
            onCreated={({ gl, invalidate }) => {
              requestFrame.current=invalidate;
              gl.setClearColor("#18222D", 0);
              gl.toneMapping = ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.08;
            }}
          >
            <Studio onFailure={handleFailure} />
            <Engine paused={paused} pointer={pointer} activeIndex={activeIndex} />
            <ReadySignal onReady={handleReady}/>
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
