// main.ts
import { Vector3, Color4 } from '@dcl/sdk/math'
import {
  engine,
  GltfContainer,
  Transform,
  Entity,
  UiText,
  InputAction,
  PointerEvents,
  PointerEventType,
  PointerEventsResult,
  UiTransform,
  YGPositionType,
  MeshCollider
} from '@dcl/sdk/ecs'
import { changeColorSystem, circularSystem, collectiblesSystem, npcInteractionSystem } from './systems'
import { setupUi, showDialogUI } from './ui' // Importamos showDialogUI
import { Spinner } from './components'
import { createCharacter, createCollectible } from './factory'

// Definir una interfaz para los objetos recolectables
export interface Collectible {
  id: string
  entity: Entity
}

// Lista de todos los objetos recolectables
let collectibles: Collectible[] = []

// Conjunto de identificadores de objetos recolectados
let collectedSet: Set<string> = new Set()

export function main() {
  let characterEntity: Entity

  // Crear el NPC
  characterEntity = createCharacter('robot2', Vector3.create(5, 1, 5), Vector3.create(0.5, 0.5, 0.5))

  // Crear tres objetos recolectables con identificadores únicos
  collectibles.push(createCollectible('pc1', 'pc', Vector3.create(3, 1, 3)))
  collectibles.push(createCollectible('avocado', 'avocado', Vector3.create(6, 1, 3)))
  collectibles.push(createCollectible('pc2', 'pc', Vector3.create(9, 1, 3)))

  // Agregar systems
  engine.addSystem(() => collectiblesSystem(collectibles, collectedSet))
  engine.addSystem(() => npcInteractionSystem(characterEntity, showDialogUI))
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)  

  setupUi()
}
