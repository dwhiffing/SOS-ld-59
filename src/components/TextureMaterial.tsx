import { BoxGeometry, BufferAttribute } from 'three'

export const TextureMaterial = ({
  path,
  color,
}: {
  path: string
  color?: string
}) => {
  return <meshStandardMaterial color={color} />
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
