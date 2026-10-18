import { RigidBody } from '@react-three/rapier'
import { useWorld } from 'koota/react'
import { useEffect, useRef } from 'react'
import { type Group } from 'three'
import { type Genre } from '../data/tapes'
import FlickerLight from '../entities/flickerLight'
import Block from '../entities/store/block'
import Label from '../entities/store/label'
import TapeShelf from '../entities/store/tapeShelf'
import { Mesh } from '../shared/traits'

// Placeholder video store. Front of the store (entrance, counter, drop bin)
// is at -z, shelves fill the back half.
export const STORE_WIDTH = 6
export const STORE_DEPTH = 4
export const STORE_HEIGHT = 1
const WALL = 0.1

const halfW = STORE_WIDTH / 2
const halfD = STORE_DEPTH / 2

const FLOOR_COLOR = '#3a4a6b'
const WALL_COLOR = '#d8d2c4'
const TRIM_COLOR = '#1d3fbf'

// Shelves along the back wall and a row in the middle, all facing the front
const SHELVES: { genre: Genre; position: [number, number, number] }[] = [
  { genre: 'Action', position: [-2.1, 0, halfD - WALL - 0.08] },
  { genre: 'Comedy', position: [-0.7, 0, halfD - WALL - 0.08] },
  { genre: 'Drama', position: [0.7, 0, halfD - WALL - 0.08] },
  { genre: 'Horror', position: [2.1, 0, halfD - WALL - 0.08] },
  { genre: 'Sci-Fi', position: [-1.0, 0, 0.4] },
  { genre: 'Family', position: [1.0, 0, 0.4] },
]

export function Store({ hideCeiling = false }: { hideCeiling?: boolean }) {
  const world = useWorld()
  const ref = useRef<Group>(null)

  // Register the store so the controller can find its interactables
  useEffect(() => {
    if (!ref.current) return
    const entity = world.spawn(Mesh(ref.current))
    return () => void entity.destroy()
  }, [world])

  return (
    <group ref={ref}>
      <RigidBody type="fixed" colliders={false}>
        {/* shell */}
        <Block
          size={[STORE_WIDTH, WALL, STORE_DEPTH]}
          position={[0, -WALL / 2, 0]}
          color={FLOOR_COLOR}
        />
        {!hideCeiling && (
          <Block
            size={[STORE_WIDTH, WALL, STORE_DEPTH]}
            position={[0, STORE_HEIGHT + WALL / 2, 0]}
            color="#eeeeee"
          />
        )}
        <Block
          size={[STORE_WIDTH, STORE_HEIGHT, WALL]}
          position={[0, STORE_HEIGHT / 2, halfD - WALL / 2]}
          color={WALL_COLOR}
        />
        <Block
          size={[STORE_WIDTH, STORE_HEIGHT, WALL]}
          position={[0, STORE_HEIGHT / 2, -halfD + WALL / 2]}
          color={WALL_COLOR}
        />
        <Block
          size={[WALL, STORE_HEIGHT, STORE_DEPTH]}
          position={[halfW - WALL / 2, STORE_HEIGHT / 2, 0]}
          color={WALL_COLOR}
        />
        <Block
          size={[WALL, STORE_HEIGHT, STORE_DEPTH]}
          position={[-halfW + WALL / 2, STORE_HEIGHT / 2, 0]}
          color={WALL_COLOR}
        />

        {/* store front: windows and entrance (decorative, not walkable) */}
        <Block
          size={[2.2, 0.5, 0.01]}
          position={[-1.5, 0.45, -halfD + WALL + 0.005]}
          color="#9fc6e8"
          emissive="#3d5a7a"
          collider={false}
        />
        <Block
          size={[0.4, 0.62, 0.01]}
          position={[0.6, 0.31, -halfD + WALL + 0.005]}
          color="#9fc6e8"
          emissive="#3d5a7a"
          collider={false}
        />
        <Label
          text="ENTRANCE"
          position={[0.6, 0.7, -halfD + WALL + 0.01]}
          width={0.4}
          height={0.07}
          background={TRIM_COLOR}
          color="#ffd400"
        />

        {/* checkout counter */}
        <group name="counter" userData={{ label: 'Counter' }}>
          <Block size={[1.2, 0.32, 0.3]} position={[-1.6, 0.16, -1.0]} color={TRIM_COLOR} />
          <Block
            size={[1.24, 0.02, 0.34]}
            position={[-1.6, 0.33, -1.0]}
            color="#ffd400"
            collider={false}
          />
          {/* placeholder register */}
          <Block size={[0.14, 0.08, 0.1]} position={[-1.3, 0.38, -1.0]} color="#222" collider={false} />
        </group>
        <Label
          text="CHECKOUT"
          position={[-1.6, 0.75, -1.0]}
          rotation={[0, Math.PI, 0]}
          width={0.5}
          height={0.08}
          background={TRIM_COLOR}
          color="#ffd400"
        />

        {/* quick drop bin for returned tapes */}
        <group name="dropBin" userData={{ label: 'Quick drop bin' }}>
          <Block size={[0.3, 0.28, 0.3]} position={[1.4, 0.14, -halfD + WALL + 0.17]} color="#2e7d32" />
        </group>
        <Label
          text="RETURNS"
          position={[1.4, 0.36, -halfD + WALL + 0.33]}
          width={0.3}
          height={0.06}
          background="#2e7d32"
        />

        {SHELVES.map(({ genre, position }) => (
          <TapeShelf key={genre} genre={genre} position={position} rotation={[0, Math.PI, 0]} />
        ))}
      </RigidBody>

      {[-2, 0, 2].map((x) => (
        <FlickerLight
          key={x}
          position={[x, 0, 0]}
          intensity={6}
          color="#f4f1e6"
          defaultOn
          castShadow={x === 0}
        />
      ))}
    </group>
  )
}

export default Store
