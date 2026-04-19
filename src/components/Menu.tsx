import React from 'react'
import useGameStore from '../stores/gameStore'

export function Menu() {
  const setScene = useGameStore((s) => s.setScene)

  return (
    <div className="menu">
      <h1 style={{ fontSize: 48, marginBottom: 24 }}>Signal</h1>
      <button
        onClick={() => setScene('game')}
        style={{ fontSize: 18, padding: '12px 24px' }}>
        Start Game
      </button>
    </div>
  )
}

export default Menu
