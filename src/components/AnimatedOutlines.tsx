import { useSpring } from '@react-spring/three'
import { Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'

const clamp = (number: number, min: number, max: number) =>
  Math.max(min, Math.min(number, max))

export function AnimatedOutlines(props: {
  thickness?: number
  opacity?: number
  color?: string
}) {
  const [_opacity, setOpacity] = useState('0')
  const springProps = useSpring({
    opacity: props.opacity ?? 1,
    config: { tension: 510, friction: 50 },
  })

  useFrame(() => {
    setOpacity(clamp(springProps.opacity.get(), 0, 1).toFixed(1))
  })

  return (
    <Outlines
      transparent
      thickness={props.thickness ?? 3}
      color={props.color ?? '#fff'}
      opacity={+_opacity}
    />
  )
}
