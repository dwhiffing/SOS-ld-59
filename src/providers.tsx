import { useFrame } from '@react-three/fiber'
import { createWorld } from 'koota'
import { useWorld, WorldProvider } from 'koota/react'
import { createContext, use, useMemo, type ReactNode } from 'react'
import { controllerInputSystem } from './entities/controller/system'

export function RootProviders({ children }: { children: ReactNode }) {
  const world = useMemo(() => createWorld(), [])

  return <WorldProvider world={world}>{children}</WorldProvider>
}

const NestedCheck = createContext(false)

export function KootaSystems({ children }: { children: ReactNode }) {
  const isNested = use(NestedCheck)
  const world = useWorld()

  useFrame((_, delta) => {
    if (isNested) {
      // This turns off the systems if they are already running in a parent component.
      // This can happen when running inside Triplex as the systems are running in the CanvasProvider.
      return
    }

    controllerInputSystem(world, delta)
  })

  return <NestedCheck value>{children}</NestedCheck>
}
