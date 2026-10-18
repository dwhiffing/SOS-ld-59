# Blockbuster Manager

First person video store manager game, built on the SOS (Ludum Dare 59) engine.

Status: engine stripped of the morse gameplay, with a placeholder store (shelves stocked by genre, checkout counter, quick drop bin). Look at something to see its label; click (or tap) to interact. Real interactions come next.

## Run

```
pnpm install
pnpm dev
```

## Controls

- Click to lock the mouse, WASD / arrows to move, click to interact
- M cycles sound mode
- Mobile: drag to look, double tap and hold to walk, tap to interact

## Layout

- `src/levels/store.tsx`: the store layout (walls, shelves, counter, drop bin, lights)
- `src/entities/store/`: placeholder pieces (`Block`, `Label`, `TapeShelf`)
- `src/data/tapes.ts`: placeholder catalogue of genres and titles
- `src/entities/controller/`: first person movement and look/interact raycast. Any object named in `INTERACTABLE_NAMES` with a `userData.label` can be looked at and interacted with.
- `src/stores/gameStore.ts`: zustand state (sound mode, what you're looking at, last interaction)

Built with [Koota](https://github.com/pmndrs/koota), [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [Rapier](https://github.com/pmndrs/react-three-rapier), Vite and TypeScript.
