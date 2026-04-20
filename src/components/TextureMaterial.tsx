import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { BoxGeometry, BufferAttribute, RepeatWrapping } from 'three'

export const TextureMaterial = ({
  path,
  color,
}: {
  path: string
  color?: string
}) => {
  const { gl } = useThree()
  const [colorMap] = useTexture([
    `./${path}/diff.jpg`,
    // `./${path}/dx.jpg`,
    // `./${path}/rough.jpg`,
    // `./${path}/ao.jpg`,
  ])
  colorMap.wrapS = RepeatWrapping
  colorMap.wrapT = RepeatWrapping
  // normalMap.wrapS = RepeatWrapping
  // normalMap.wrapT = RepeatWrapping
  // roughnessMap.wrapS = RepeatWrapping
  // roughnessMap.wrapT = RepeatWrapping
  // aoMap.wrapS = RepeatWrapping
  // aoMap.wrapT = RepeatWrapping

  // Pre-upload textures to GPU immediately so the first render doesn't spike
  useEffect(() => {
    gl.initTexture(colorMap)
    // gl.initTexture(normalMap)
    // gl.initTexture(roughnessMap)
    // gl.initTexture(aoMap)
  }, [gl, colorMap])

  return (
    <meshStandardMaterial
      // map={colorMap}
      // normalMap={normalMap}
      // roughnessMap={roughnessMap}
      // aoMap={aoMap}
      color={color}
    />
  )
}

export const getBoxGeometry = (
  width: number,
  height: number,
  depth: number,
  scale: number = 1,
) => {
  const geometry = new BoxGeometry(width, height, depth)
  const uv = geometry.attributes.uv
  const pos = geometry.attributes.position

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)

    if (i < 8) uv.setXY(i, z / scale, y / scale)
    else if (i < 16) uv.setXY(i, x / scale, z / scale)
    else uv.setXY(i, x / scale, y / scale)
  }
  uv.needsUpdate = true

  const uvArray = new Float32Array(uv.array.length)
  uvArray.set(uv.array)
  const uv2 = new BufferAttribute(uvArray, 2)
  geometry.setAttribute('uv2', uv2)

  return geometry
}
