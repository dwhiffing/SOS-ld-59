import { trait } from 'koota'

export const LightSource = trait({
  id: '',
  position: [0, 0, 0] as [number, number, number],
  isActive: false,
})
