import { CuboidCollider } from '@react-three/rapier'
import { TextureMaterial } from '../components/TextureMaterial'

interface RockProps {
  position: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
}

export function Rock({ position, scale, rotation = [0, 0, 0] }: RockProps) {
  const [w, h, d] = scale
  return (
    <>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} position={position} />
      <mesh
        position={position}
        scale={scale}
        rotation={rotation}
        castShadow
        receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <TextureMaterial path="wall" color="#4a4a4a" />
      </mesh>
    </>
  )
}

export function CornerBoulder({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Rock
        position={[0.02, 0.37, -0.06]}
        scale={[0.58, 0.74, 0.32]}
        rotation={[0, 0.3, 0]}
      />
      <Rock
        position={[0.34, 0.37, -0.02]}
        scale={[0.58, 1.03, 0.32]}
        rotation={[-0.088, -0.636, -3.016]}
      />
      <Rock
        position={[-0.36, 0.37, -0.15]}
        scale={[0.58, 1.03, 0.32]}
        rotation={[-0.096, 0.739, -2.898]}
      />
      <Rock
        position={[0.1, 0.63, -0.07]}
        scale={[0.14, 0.37, 0.25]}
        rotation={[0.1, 0.9, -0.05]}
      />
      <Rock
        position={[-0.23, 0.64, -0.18]}
        scale={[1.12, 0.51, 0.26]}
        rotation={[-1.284, 1.491, -3.127]}
      />
      <Rock
        position={[-0.02, 0.89, -0.21]}
        scale={[0.28, 0.39, 0.24]}
        rotation={[-0.952, 0.302, 1.264]}
      />
      <Rock
        position={[0.12, 0.81, -0.16]}
        scale={[0.77, 0.22, 0.24]}
        rotation={[-1.638, -0.677, -0.809]}
      />
      <Rock
        position={[0.03, 0.11, 0.07]}
        scale={[0.28, 0.46, 0.38]}
        rotation={[0, 0.8, 0]}
      />
      <Rock
        position={[-0.25, 0.18, -0.05]}
        scale={[0.26, 0.34, 0.28]}
        rotation={[0, -0.4, 0]}
      />
      <Rock
        position={[-0.11, 0.09, 0.02]}
        scale={[0.24, 0.29, 0.26]}
        rotation={[0, 1.5, 0]}
      />
      <Rock
        position={[0.23, 0.07, 0.02]}
        scale={[0.14, 0.14, 0.13]}
        rotation={[0, -0.5, 0]}
      />
    </group>
  )
}

export function BigRockWithPebbles({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Rock
        position={[0, 0.17, 0]}
        scale={[0.64, 0.61, 0.6]}
        rotation={[0, 0.2, 0.05]}
      />
      <Rock
        position={[-0.29, 0.03, 0.11]}
        scale={[0.09, 0.09, 0.09]}
        rotation={[0, 1.1, 0]}
      />
      <Rock
        position={[-0.25, 0.01, 0.18]}
        scale={[0.04, 0.02, 0.08]}
        rotation={[0, -0.4, 0]}
      />
      <Rock
        position={[0.16, 0.01, 0.21]}
        scale={[0.03, 0.03, 0.04]}
        rotation={[0, -1.06, 0]}
      />
    </group>
  )
}

export function RockCluster({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Rock
        position={[-0.09, 0.13, -0.1]}
        scale={[0.49, 3.45, 0.42]}
        rotation={[-3.14, 0.894, -3.14]}
      />
      <Rock
        position={[-0.28, 0.88, 0.18]}
        scale={[0.18, 2.04, 0.1]}
        rotation={[-3.14, 0.057, -3.14]}
      />
      <Rock
        position={[0.04, 0.71, -0.44]}
        scale={[0.4, 0.94, 0.38]}
        rotation={[-3.14, 0.947, 3.14]}
      />
      <Rock
        position={[0.13, 1.49, 0.01]}
        scale={[0.1, 1.97, 0.1]}
        rotation={[-3.14, 0.057, -3.14]}
      />
      <Rock
        position={[0.06, 0.13, -0.29]}
        scale={[0.18, 2.04, 0.1]}
        rotation={[-3.14, 0.057, -3.14]}
      />
      <Rock
        position={[-0.06, 0.56, 0.21]}
        scale={[0.18, 2.04, 0.1]}
        rotation={[-3.14, 0.057, -3.14]}
      />
    </group>
  )
}

export function RockFloor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Rock
        position={[-0.01, -0.03, -0.09]}
        scale={[0.7, 0.17, 0.59]}
        rotation={[0.042, 0.193, -0.017]}
      />
      <Rock
        position={[0.16, -0.03, 0.1]}
        scale={[0.7, 0.17, 0.59]}
        rotation={[-2.826, 1.151, 2.891]}
      />
    </group>
  )
}

export function Rubble({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* medium rocks */}
      <Rock
        position={[0.03, 0.08, -0.24]}
        scale={[0.51, 0.95, 0.49]}
        rotation={[0, 0.3, 0]}
      />
      <Rock
        position={[-0.03, 0.08, -0.34]}
        scale={[0.62, 3.03, 0.34]}
        rotation={[0, 0.3, 0]}
      />
      <Rock
        position={[0.22, 0.09, -0.12]}
        scale={[0.18, 0.24, 0.17]}
        rotation={[0, -0.8, 0]}
      />
      {/* small rocks */}
      <Rock
        position={[-0.1, 0.05, 0]}
        scale={[0.14, 0.14, 0.14]}
        rotation={[0, 1.0, 0]}
      />
      <Rock
        position={[-0.01, 0, -0.05]}
        scale={[0.19, 0.1, 0.19]}
        rotation={[0, 0.7, 0]}
      />
      <Rock
        position={[-0.14, 0.04, 0.08]}
        scale={[0.1, 0.07, 0.08]}
        rotation={[0, -0.3, 0]}
      />
      <Rock
        position={[0.31, 0.04, -0.11]}
        scale={[0.1, 0.08, 0.09]}
        rotation={[0, 1.3, 0]}
      />
      <Rock
        position={[0.15, 0.04, -0.07]}
        scale={[0.09, 0.07, 0.09]}
        rotation={[0, -1.1, 0]}
      />
      {/* tiny rocks */}
      <Rock
        position={[-0.06, 0.015, 0.14]}
        scale={[0.022, 0.015, 0.02]}
        rotation={[0, 0.9, 0]}
      />
      <Rock
        position={[-0.18, 0.015, -0.06]}
        scale={[0.02, 0.015, 0.018]}
        rotation={[0, 1.1, 0]}
      />
      <Rock
        position={[0.04, 0.015, 0.16]}
        scale={[0.016, 0.012, 0.018]}
        rotation={[0, -1.6, 0]}
      />
      <Rock
        position={[-0.12, 0.015, 0.1]}
        scale={[0.018, 0.012, 0.016]}
        rotation={[0, 2.0, 0]}
      />
      <Rock
        position={[-0.08, 0.015, -0.02]}
        scale={[0.014, 0.01, 0.013]}
        rotation={[0, -2.8, 0]}
      />
      <Rock
        position={[-0.16, 0.015, 0.06]}
        scale={[0.016, 0.011, 0.014]}
        rotation={[0, -0.5, 0]}
      />
      <Rock
        position={[0.06, 0.015, 0.08]}
        scale={[0.013, 0.01, 0.014]}
        rotation={[0, 1.4, 0]}
      />
      <Rock
        position={[0.3, 0.015, -0.06]}
        scale={[0.022, 0.015, 0.02]}
        rotation={[0, -2.2, 0]}
      />
      <Rock
        position={[0.14, 0.015, -0.2]}
        scale={[0.02, 0.015, 0.02]}
        rotation={[0, 1.7, 0]}
      />
      <Rock
        position={[0.36, 0.015, -0.18]}
        scale={[0.016, 0.012, 0.015]}
        rotation={[0, 0.3, 0]}
      />
      <Rock
        position={[0.18, 0.015, -0.28]}
        scale={[0.015, 0.011, 0.016]}
        rotation={[0, -1.0, 0]}
      />
      <Rock
        position={[0.28, 0.015, 0.02]}
        scale={[0.014, 0.011, 0.015]}
        rotation={[0, 2.4, 0]}
      />
      <Rock
        position={[0.12, 0.015, -0.14]}
        scale={[0.013, 0.01, 0.014]}
        rotation={[0, 0.7, 0]}
      />
      <Rock
        position={[0.34, 0.015, -0.28]}
        scale={[0.012, 0.01, 0.013]}
        rotation={[0, 1.9, 0]}
      />
    </group>
  )
}
