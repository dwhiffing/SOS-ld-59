import { trait } from 'koota'
import { Object3D } from 'three'

export const Mesh = trait(() => new Object3D())

export const PhysicsBody = trait({ api: {} })
