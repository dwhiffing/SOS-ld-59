import { CuboidCollider } from '@react-three/rapier'
import { getBoxGeometry, TextureMaterial } from './TextureMaterial'
import { doorH, doorW, roomHeight } from '../entities/room'

export function Plane({
  colliderArgs,
  meshArgs,
  position,
  texturePath,
  textureScale = 2,
  isDoor = false,
  doorWidth = doorW,
  doorHeight = doorH,
  orientation = 'horizontal',
}: {
  colliderArgs: [number, number, number]
  meshArgs: [number, number, number]
  position: [number, number, number]
  texturePath: string
  textureScale?: number
  isDoor?: boolean
  doorWidth?: number
  doorHeight?: number
  orientation?: 'horizontal' | 'vertical'
}) {
  // backward-compatible single-plane render when not a door split
  if (!isDoor) {
    return (
      <>
        <CuboidCollider args={colliderArgs} position={position} />
        <mesh castShadow receiveShadow position={position}>
          <primitive
            object={getBoxGeometry(
              meshArgs[0],
              meshArgs[1],
              meshArgs[2],
              textureScale,
            )}
          />
          <TextureMaterial
            path={texturePath}
            color={texturePath === 'wall' ? '#444' : undefined}
          />
        </mesh>
      </>
    )
  }

  // When rendering a wall with a centered doorway, split into parts.
  // We assume the provided meshArgs describe the full wall: [width, height, depth]
  const [width, height, depth] = meshArgs
  // orientation: horizontal means door sits along X (i.e., north/south wall), so split width
  const parts: any[] = []

  if (orientation === 'horizontal') {
    const sideWidth = Math.max(0, (width - doorWidth) / 2)
    const sideHalf = sideWidth / 2
    const topHeight = Math.max(0, height - doorHeight)
    const topHalf = topHeight / 2

    // left part
    if (sideWidth > 0) {
      parts.push(
        <group key="left">
          <CuboidCollider
            args={[sideHalf, height / 2, depth / 2]}
            position={[
              position[0] - width / 2 + sideHalf,
              position[1],
              position[2],
            ]}
          />
          <mesh
            castShadow
            receiveShadow
            position={[
              position[0] - width / 2 + sideHalf,
              position[1],
              position[2],
            ]}
          >
            <primitive
              object={getBoxGeometry(sideWidth, height, depth, textureScale)}
            />
            <TextureMaterial
              path={texturePath}
              color={texturePath === 'wall' ? '#444' : undefined}
            />
          </mesh>
        </group>,
      )
    }

    // right part
    if (sideWidth > 0) {
      parts.push(
        <group key="right">
          <CuboidCollider
            args={[sideHalf, height / 2, depth / 2]}
            position={[
              position[0] + width / 2 - sideHalf,
              position[1],
              position[2],
            ]}
          />
          <mesh
            castShadow
            receiveShadow
            position={[
              position[0] + width / 2 - sideHalf,
              position[1],
              position[2],
            ]}
          >
            <primitive
              object={getBoxGeometry(sideWidth, height, depth, textureScale)}
            />
            <TextureMaterial
              path={texturePath}
              color={texturePath === 'wall' ? '#444' : undefined}
            />
          </mesh>
        </group>,
      )
    }

    // top part above door
    if (topHeight > 0) {
      parts.push(
        <group key="top">
          <mesh
            castShadow
            receiveShadow
            position={[position[0], position[1] + doorHeight / 2, position[2]]}
          >
            <primitive
              object={getBoxGeometry(doorWidth, topHeight, depth, textureScale)}
            />
            <TextureMaterial
              path={texturePath}
              color={texturePath === 'wall' ? '#444' : undefined}
            />
          </mesh>
        </group>,
      )
    }
  } else {
    // vertical orientation (east/west walls) - split along depth (Z)
    const sideDepth = Math.max(0, (depth - doorWidth) / 2)
    const sideHalf = sideDepth / 2
    const topHeight = Math.max(0, roomHeight - doorHeight)

    if (sideDepth > 0) {
      parts.push(
        <group key="front">
          <CuboidCollider
            args={[width / 2, height / 2, sideHalf]}
            position={[
              position[0],
              position[1],
              position[2] - depth / 2 + sideHalf,
            ]}
          />
          <mesh
            castShadow
            receiveShadow
            position={[
              position[0],
              position[1],
              position[2] - depth / 2 + sideHalf,
            ]}
          >
            <primitive
              object={getBoxGeometry(width, height, sideDepth, textureScale)}
            />
            <TextureMaterial
              path={texturePath}
              color={texturePath === 'wall' ? '#444' : undefined}
            />
          </mesh>
        </group>,
      )
      parts.push(
        <group key="back">
          <CuboidCollider
            args={[width / 2, height / 2, sideHalf]}
            position={[
              position[0],
              position[1],
              position[2] + depth / 2 - sideHalf,
            ]}
          />
          <mesh
            castShadow
            receiveShadow
            position={[
              position[0],
              position[1],
              position[2] + depth / 2 - sideHalf,
            ]}
          >
            <primitive
              object={getBoxGeometry(width, height, sideDepth, textureScale)}
            />
            <TextureMaterial
              path={texturePath}
              color={texturePath === 'wall' ? '#444' : undefined}
            />
          </mesh>
        </group>,
      )
    }

    if (topHeight > 0) {
      parts.push(
        <group key="top">
          <mesh
            castShadow
            receiveShadow
            position={[position[0], position[1] + doorHeight / 2, position[2]]}
          >
            <primitive
              object={getBoxGeometry(width, topHeight, doorWidth, textureScale)}
            />
            <TextureMaterial
              path={texturePath}
              color={texturePath === 'wall' ? '#444' : undefined}
            />
          </mesh>
        </group>,
      )
    }
  }

  return <>{parts}</>
}
