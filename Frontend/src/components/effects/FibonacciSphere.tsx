"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * Interactive 3D Fibonacci (phyllotaxis) sphere — the Hero's right-side
 * visual. Transparent canvas, no container/card, continuous rotation, a
 * slow cinematic camera fly-through the poles, a cursor-driven repulsion
 * "hole", and a scroll-triggered explode/reform pulse.
 */

const GOLDEN_ANGLE = 137.507764 * (Math.PI / 180);
const PARTICLE_COUNT = 3400;
const SPHERE_RADIUS = 1.65;

// Mouse repulsion tuning.
const REPEL_RADIUS = 0.62;
const REPEL_STRENGTH = 0.8;
const REPEL_EASE = 0.14;
// Floor on ray-distance used only to keep the falloff division numerically
// stable — without it, particles landing almost exactly on the cursor ray
// get divided by a near-zero distance and fly off to absurd distances.
const REPEL_MIN_DIST = 0.03;

// Scroll explode/reform tuning.
const SCROLL_ENERGY_GAIN = 0.003;
const SCROLL_ENERGY_MAX = 1;
const SCROLL_ENERGY_DECAY = 0.95;
const SCROLL_SPREAD_MULT = 1.6;

function buildFibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    positions[i * 3] = x * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = z * radius;
  }

  return positions;
}

type HoverRef = { current: boolean };

function ParticleSphere({ hoverRef }: { hoverRef: HoverRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });

  // Static reference layout (the pure Fibonacci-sphere positions).
  const originalPositions = useMemo(
    () => buildFibonacciSphere(PARTICLE_COUNT, SPHERE_RADIUS),
    []
  );
  // Mutable buffer we ease toward the (repulsion + scroll-spread) target
  // each frame — this is what's actually rendered.
  const currentPositions = useMemo(
    () => originalPositions.slice(),
    [originalPositions]
  );

  const scrollEnergy = useRef(0);
  const lastScrollY = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const invQuat = useRef(new THREE.Quaternion());
  const localOrigin = useRef(new THREE.Vector3());
  const localDir = useRef(new THREE.Vector3());

  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.25, "rgba(255,255,255,0.95)");
      gradient.addColorStop(0.55, "rgba(108,229,255,0.55)");
      gradient.addColorStop(1, "rgba(108,229,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.PointsMaterial({
      size: 0.052,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
      color: new THREE.Color("#ffffff"),
      sizeAttenuation: true,
    });
  }, []);

  useFrame((state, delta) => {
    // --- Continuous multi-axis rotation, with a very subtle cursor tilt.
    targetMouse.current.x = (state.pointer.x || 0) * 0.15;
    targetMouse.current.y = (state.pointer.y || 0) * 0.15;
    mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.03;
    mouse.current.y += (targetMouse.current.y - mouse.current.y) * 0.03;

    const group = groupRef.current;
    if (!group) return;

    group.rotation.y += 0.12 * delta + mouse.current.x * 0.01;
    group.rotation.x += 0.05 * delta + mouse.current.y * 0.01;
    group.rotation.z += 0.03 * delta;

    // --- Scroll-driven explode energy: spikes on scroll, decays back to 0
    // (the sphere "explodes" outward and smoothly reforms once idle).
    const scrollY =
      typeof window !== "undefined" ? window.scrollY || 0 : 0;
    const scrollDelta = scrollY - lastScrollY.current;
    lastScrollY.current = scrollY;
    scrollEnergy.current = Math.min(
      scrollEnergy.current + Math.abs(scrollDelta) * SCROLL_ENERGY_GAIN,
      SCROLL_ENERGY_MAX
    );
    scrollEnergy.current *= SCROLL_ENERGY_DECAY;
    const spreadScale = 1 + scrollEnergy.current * SCROLL_SPREAD_MULT;

    // --- Mouse repulsion ray, transformed into the group's local space so
    // the "hole" tracks the cursor correctly regardless of rotation.
    const hovering = hoverRef.current;
    if (hovering) {
      raycaster.setFromCamera(state.pointer, state.camera);
      invQuat.current.copy(group.quaternion).invert();
      localOrigin.current.copy(raycaster.ray.origin).applyQuaternion(invQuat.current);
      localDir.current
        .copy(raycaster.ray.direction)
        .applyQuaternion(invQuat.current)
        .normalize();
    }

    const ox = localOrigin.current.x;
    const oy = localOrigin.current.y;
    const oz = localOrigin.current.z;
    const dx = localDir.current.x;
    const dy = localDir.current.y;
    const dz = localDir.current.z;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const bx = originalPositions[idx] * spreadScale;
      const by = originalPositions[idx + 1] * spreadScale;
      const bz = originalPositions[idx + 2] * spreadScale;

      let pushX = 0;
      let pushY = 0;
      let pushZ = 0;

      if (hovering) {
        const vx = bx - ox;
        const vy = by - oy;
        const vz = bz - oz;
        const t = vx * dx + vy * dy + vz * dz;

        if (t > 0) {
          const cx = ox + dx * t;
          const cy = oy + dy * t;
          const cz = oz + dz * t;
          const ddx = bx - cx;
          const ddy = by - cy;
          const ddz = bz - cz;
          const distSq = ddx * ddx + ddy * ddy + ddz * ddz;

          if (distSq < REPEL_RADIUS * REPEL_RADIUS) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / REPEL_RADIUS;
            const eased = falloff * falloff;
            const magnitude = eased * REPEL_STRENGTH;
            // Scale by dist/safeDist (never > 1) instead of 1/dist directly,
            // so the push length is provably bounded by `magnitude` even as
            // dist → 0 (fixes the runaway-explosion bug).
            const safeDist = Math.max(dist, REPEL_MIN_DIST);
            const scale = magnitude / safeDist;
            pushX = ddx * scale;
            pushY = ddy * scale;
            pushZ = ddz * scale;
          }
        }
      }

      currentPositions[idx] += (bx + pushX - currentPositions[idx]) * REPEL_EASE;
      currentPositions[idx + 1] +=
        (by + pushY - currentPositions[idx + 1]) * REPEL_EASE;
      currentPositions[idx + 2] +=
        (bz + pushZ - currentPositions[idx + 2]) * REPEL_EASE;
    }

    const attr = pointsRef.current?.geometry.attributes.position as
      | THREE.BufferAttribute
      | undefined;
    if (attr) attr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} material={material} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[currentPositions, 3]}
          />
        </bufferGeometry>
      </points>
    </group>
  );
}

/** Gentle, fixed-distance camera sway. The camera never zooms in or out —
 * it simply drifts in a slow, subtle orbit around the sphere so the
 * particle cloud always reads at a consistent size with no risk of
 * overflowing (and clipping against) the canvas frame. */
function CinematicCamera() {
  const { camera } = useThree();
  const t = useRef(0);
  const BASE_DISTANCE = 5.2;

  useFrame((_, delta) => {
    t.current += delta;

    const lateral = Math.sin(t.current * 0.12) * 0.35;
    const vertical = Math.sin(t.current * 0.09) * 0.25;

    camera.position.set(lateral, vertical, BASE_DISTANCE);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function FibonacciSphere({ className = "" }: { className?: string }) {
  const hoverRef = useRef(false);

  return (
    <div
      className={`pointer-events-auto select-none overflow-hidden ${className}`}
      style={{
        maskImage:
          "radial-gradient(circle at 50% 50%, #000 58%, rgba(0,0,0,0.35) 78%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, #000 58%, rgba(0,0,0,0.35) 78%, transparent 100%)",
      }}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      aria-hidden
    >
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
        camera={{ fov: 45, near: 0.1, far: 20, position: [0, 0, 5.2] }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <ParticleSphere hoverRef={hoverRef} />
          <CinematicCamera />
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.85}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              mipmapBlur
              radius={0.6}
            />
            <Vignette eskil={false} offset={0.25} darkness={0.6} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
