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
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  PMREMGenerator,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type SceneProps = {
  paused: boolean;
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

function orbitPoint(angle: number, radius: number, inclination: number) {
  return new Vector3(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 0.56,
    Math.sin(angle + inclination) * 0.64 - 0.45,
  );
}

function Circuit({ radius, inclination }: { radius: number; inclination: number }) {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 120 }, (_, index) =>
      orbitPoint((index / 120) * Math.PI * 2, radius, inclination),
    );
    return new BufferGeometry().setFromPoints(points);
  }, [radius, inclination]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#d5f26d" transparent opacity={0.26} />
    </lineLoop>
  );
}

function Constellation() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < 38; i += 1) {
      const angle = i * 2.399963;
      const radius = 2.15 + ((i * 17) % 13) / 13;
      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.85,
        -1.9 - ((i * 7) % 9) / 5,
      );
    }
    return new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3),
    );
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#e0eece" size={0.024} transparent opacity={0.38} sizeAttenuation />
    </points>
  );
}

function Engine({ paused, pointer, scroll }: { paused: boolean; pointer: RefObject<Pointer>; scroll: RefObject<number> }) {
  const sculpture = useRef<Group>(null);
  const core = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const satelliteOne = useRef<Mesh>(null);
  const satelliteTwo = useRef<Mesh>(null);
  const satelliteThree = useRef<Mesh>(null);
  const time = useRef(0);

  useFrame((_state, rawDelta) => {
    if (paused || !sculpture.current) return;
    const delta = Math.min(rawDelta, 0.045);
    time.current += delta;
    const elapsed = time.current;

    sculpture.current.rotation.x = MathUtils.damp(
      sculpture.current.rotation.x,
      -pointer.current.y * 0.12 + Math.sin(elapsed * 0.19) * 0.04,
      3,
      delta,
    );
    sculpture.current.rotation.y = MathUtils.damp(
      sculpture.current.rotation.y,
      pointer.current.x * 0.2 - 0.1 + Math.sin(elapsed * 0.15) * 0.15 + scroll.current * 0.65,
      3,
      delta,
    );
    sculpture.current.position.y = Math.sin(elapsed * 0.48) * 0.065;
    sculpture.current.rotation.z = MathUtils.damp(sculpture.current.rotation.z, scroll.current * -0.18, 4, delta);
    if (rings.current) {
      rings.current.children.forEach((ring, i) => {
        const origins = [[-0.6, 0.4, 0], [0.66, 0.18, 0.08], [0.08, -0.63, 0.24]];
        const [x, y, z] = origins[i];
        ring.position.set(MathUtils.damp(ring.position.x, x * (1 + scroll.current * 0.45), 4, delta), MathUtils.damp(ring.position.y, y * (1 + scroll.current * 0.45), 4, delta), z);
      });
    }

    if (core.current) {
      core.current.rotation.y += delta * 0.22;
      core.current.rotation.z = Math.sin(elapsed * 0.38) * 0.1;
    }

    satelliteOne.current?.position.copy(orbitPoint(elapsed * 0.2 + 0.5, 2.43, 0.6));
    satelliteTwo.current?.position.copy(orbitPoint(elapsed * 0.2 + 3.3, 2.43, 0.6));
    satelliteThree.current?.position.copy(orbitPoint(-elapsed * 0.14 + 1.6, 2.78, -0.9));
  });

  return (
    <group ref={sculpture} scale={0.92} rotation={[0, -0.1, 0]}>
      <Constellation />
      <Circuit radius={2.43} inclination={0.6} />
      <Circuit radius={2.78} inclination={-0.9} />

      <group ref={rings}>
      <group position={[-0.6, 0.4, 0]} rotation={[0.46, -0.2, -0.31]}>
        <mesh>
          <torusGeometry args={[1.2, 0.245, 28, 112]} />
          <meshPhysicalMaterial
            color="#d5f26d" roughness={0.25} metalness={0.18}
            clearcoat={0.85} clearcoatRoughness={0.18} envMapIntensity={0.95}
          />
        </mesh>
        <mesh position={[0, 0, 0.235]} rotation={[0, 0, 0.55]}>
          <torusGeometry args={[1.2, 0.013, 8, 80, Math.PI * 0.66]} />
          <meshBasicMaterial color="#f3ffcb" />
        </mesh>
      </group>

      <group position={[0.66, 0.18, 0.08]} rotation={[1.06, 0.32, 0.49]}>
        <mesh>
          <torusGeometry args={[1.24, 0.26, 28, 112]} />
          <meshPhysicalMaterial
            color="#edeedd" roughness={0.2} metalness={0.32}
            clearcoat={0.7} clearcoatRoughness={0.18} envMapIntensity={1.05}
          />
        </mesh>
        <mesh position={[0, 0, 0.25]} rotation={[0, 0, 2.35]}>
          <torusGeometry args={[1.24, 0.014, 8, 64, Math.PI * 0.55]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group position={[0.08, -0.63, 0.24]} rotation={[0.2, 1.07, -0.5]}>
        <mesh>
          <torusGeometry args={[1.2, 0.285, 28, 112]} />
          <meshPhysicalMaterial
            color="#255b4a" roughness={0.19} metalness={0.45}
            clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.3}
          />
        </mesh>
        <mesh position={[0, 0, 0.271]} rotation={[0, 0, -0.2]}>
          <torusGeometry args={[1.2, 0.025, 8, 64, Math.PI * 0.9]} />
          <meshStandardMaterial color="#d5f26d" emissive="#d5f26d" emissiveIntensity={0.3} />
        </mesh>
      </group>

      </group>
      <group ref={core} position={[0.03, 0.11, 0.55]}>
        <mesh rotation={[0.25, 0.5, 0.3]}>
          <icosahedronGeometry args={[0.34, 0]} />
          <meshPhysicalMaterial
            color="#e2ff91" metalness={0.3} roughness={0.2}
            emissive="#d5f26d" emissiveIntensity={0.16} clearcoat={1}
          />
        </mesh>
        <mesh rotation={[1.1, 0.3, -0.2]}>
          <torusGeometry args={[0.51, 0.012, 8, 64]} />
          <meshBasicMaterial color="#ecffd1" transparent opacity={0.75} />
        </mesh>
      </group>

      <mesh ref={satelliteOne} position={orbitPoint(0.5, 2.43, 0.6)}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshPhysicalMaterial color="#e8ffba" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh ref={satelliteTwo} position={orbitPoint(3.3, 2.43, 0.6)}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#d5f26d" />
      </mesh>
      <mesh ref={satelliteThree} position={orbitPoint(1.6, 2.78, -0.9)}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshPhysicalMaterial color="#eef3df" metalness={0.35} roughness={0.22} />
      </mesh>
    </group>
  );
}

export default function Scene({ paused, onFailure }: SceneProps) {
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
            camera={{ position: [0, 0, 8.4], fov: 38, near: 0.1, far: 40 }}
            dpr={[1, 1.5]}
            frameloop={paused ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            style={{ touchAction: "pan-y" }}
            fallback={<span>Your browser does not support the interactive 3D scene.</span>}
            onCreated={({ gl }) => {
              gl.setClearColor("#102a25", 0);
              gl.toneMapping = ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.08;
            }}
          >
            <Studio onFailure={handleFailure} />
            <Engine paused={paused} pointer={pointer} scroll={scroll} />
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
