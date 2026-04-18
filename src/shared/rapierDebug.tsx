import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'

class RapierDebugRenderer {
  mesh: THREE.LineSegments
  world: any
  enabled = true

  constructor(scene: THREE.Scene, world: any, color = 0xffffff) {
    this.world = world
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({ color, vertexColors: true })
    this.mesh = new THREE.LineSegments(geometry, material)
    this.mesh.frustumCulled = false
    scene.add(this.mesh)
  }

  update() {
    if (!this.world || !this.enabled) {
      this.mesh.visible = false
      return
    }

    const out = this.world.debugRender?.()
    if (!out) {
      this.mesh.visible = false
      return
    }

    const { vertices, colors } = out as {
      vertices?: Float32Array | number[]
      colors?: Float32Array | number[]
    }

    if (!vertices || !colors) {
      this.mesh.visible = false
      return
    }

    // BufferAttribute will accept typed arrays or arrays
    const posAttr = new THREE.BufferAttribute(
      vertices as Float32Array as Float32Array,
      3,
    )
    const colAttr = new THREE.BufferAttribute(
      colors as Float32Array as Float32Array,
      4,
    )

    this.mesh.geometry.setAttribute('position', posAttr)
    this.mesh.geometry.setAttribute('color', colAttr)
    // help frustum checks / bounds
    try {
      this.mesh.geometry.computeBoundingSphere()
    } catch (e) {
      // ignore
    }

    this.mesh.visible = true
  }

  dispose(scene: THREE.Scene) {
    if (!this.mesh) return
    try {
      this.mesh.geometry.dispose()
    } catch (e) {
      // ignore
    }
    try {
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach((m) => m.dispose())
      } else {
        this.mesh.material.dispose()
      }
    } catch (e) {
      // ignore
    }
    scene.remove(this.mesh)
  }
}

export default function RapierDebug({
  enabled = true,
  color = 0xffffff,
}: {
  enabled?: boolean
  color?: number
}) {
  const { scene } = useThree()
  const rapier = useRapier() as any
  const world = rapier?.world
  const rendererRef = useRef<RapierDebugRenderer | null>(null)

  useEffect(() => {
    if (!world) return
    rendererRef.current = new RapierDebugRenderer(scene, world, color)
    return () => {
      rendererRef.current?.dispose(scene)
      rendererRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, world])

  useEffect(() => {
    if (rendererRef.current) rendererRef.current.enabled = !!enabled
  }, [enabled])

  useFrame(() => {
    rendererRef.current?.update()
  })

  return null
}
