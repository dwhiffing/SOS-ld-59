import { useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Color, Mesh, MeshStandardMaterial, Object3D } from 'three'

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max))

export function AnimatedTint(props: { color?: string; opacity?: number }) {
  const ref = useRef<Object3D>(null)
  const springProps = useSpring({
    opacity: props.opacity ?? 1,
    config: { tension: 510, friction: 50 },
  })

  useFrame(() => {
    const parent = ref.current?.parent as Mesh | null
    const mat = parent?.material as MeshStandardMaterial | null
    if (!mat) return
    const t = clamp(springProps.opacity.get(), 0, 1)
    mat.emissive = new Color(props.color ?? '#fff')
    mat.emissiveIntensity = t
  })

  return <object3D ref={ref} />
}
