// main.ts
import { Vector3 } from '@dcl/sdk/math'
import { engine, Entity } from '@dcl/sdk/ecs'
import {
  changeColorSystem,
  circularSystem,
  collectiblesSystem,
  npcInteractionSystem,
  robotNpcFacePlayerSystem
} from './systems'
import { setupUi, showDialogUI } from './ui' // Importamos showDialogUI
import { createCharacter, createCheckpoint, createCollectible, createCube } from './factory'

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
  characterEntity = createCharacter(
    'robot-hello',
    Vector3.create(5, 1, 5),
    Vector3.create(0.4, 0.4, 0.4),
    'Hola Rodri!'
  )

  // Crear tres objetos recolectables con identificadores únicos
  collectibles.push(createCollectible('pc1', 'pc', Vector3.create(3, 1, 3)))
  collectibles.push(createCollectible('avocado', 'avocado', Vector3.create(6, 1, 3)))
  collectibles.push(createCollectible('pc2', 'pc', Vector3.create(9, 1, 3)))

  createParkourPath()

  // Agregar systems
  engine.addSystem(() => collectiblesSystem(collectibles, collectedSet))
  engine.addSystem(() => npcInteractionSystem(characterEntity, showDialogUI))
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)
  engine.addSystem(robotNpcFacePlayerSystem)

  setupUi()
}
// function createParkourPath() {
//   createCube(1,1,1);
//   createCube(2,2,2);

// }

function createParkourPath() {
  // Definimos las posiciones y tamaños de las plataformas con checkpoints
  const platforms = [
    // Primer grupo de 5 plataformas
    { x: 2, y: 0.5, z: 2, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 5, y: 1, z: 4, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 8, y: 1.5, z: 7, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 11, y: 2, z: 11, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 14, y: 2.5, z: 16, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    // Checkpoint después del primer grupo
    { x: 17, y: 3, z: 20, scaleX: 5, scaleY: 0.5, scaleZ: 5, isCheckpoint: true },
    // Segundo grupo de 5 plataformas con orientación diferente
    { x: 14, y: 3.5, z: 24, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 11, y: 4, z: 28, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 8, y: 4.5, z: 31, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 5, y: 5, z: 33, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 2, y: 5.5, z: 34, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    // Checkpoint después del segundo grupo
    { x: -1, y: 6, z: 35, scaleX: 5, scaleY: 0.5, scaleZ: 5, isCheckpoint: true },
    // Tercer grupo de 5 plataformas con cambio de dirección
    { x: -4, y: 6.5, z: 32, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
    { x: -7, y: 7, z: 29, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
    { x: -10, y: 7.5, z: 25, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
    { x: -13, y: 8, z: 20, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
    { x: -16, y: 8.5, z: 14, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
    // Checkpoint después del tercer grupo
    { x: -19, y: 9, z: 8, scaleX: 5, scaleY: 0.5, scaleZ: 5, isCheckpoint: true },
    // Último grupo de plataformas pequeñas
    { x: -16, y: 9.5, z: 2, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
    { x: -13, y: 10, z: -2, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
    { x: -10, y: 10.5, z: -6, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
    { x: -7, y: 11, z: -10, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
    { x: -4, y: 11.5, z: -14, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
    // Checkpoint final
    { x: -1, y: 12, z: -18, scaleX: 5, scaleY: 0.5, scaleZ: 5, isCheckpoint: true }
  ]

  // Creamos cada plataforma con posición y tamaño específicos
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i]
    // Si es un checkpoint, aplicamos un material diferente
    if (platform.isCheckpoint) {
      createCheckpoint(platform.x, platform.y, platform.z, platform.scaleX, platform.scaleY, platform.scaleZ)
    } else {
      createCube(platform.x, platform.y, platform.z, platform.scaleX, platform.scaleY, platform.scaleZ)
    }
  }
}

// function createParkourPath() {
//   // Definimos las posiciones y tamaños de las plataformas con más separación y orientación variable
//   const platforms = [
//     // Primer grupo de 5 plataformas de un tamaño
//     { x: 2, y: 0.5, z: 2, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
//     { x: 5, y: 1, z: 4, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
//     { x: 8, y: 1.5, z: 7, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
//     { x: 11, y: 2, z: 11, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
//     { x: 14, y: 2.5, z: 16, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
//     // Cambiamos el tamaño a partir del sexto cubo
//     { x: 17, y: 3, z: 22, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
//     { x: 19, y: 3.5, z: 27, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
//     { x: 21, y: 4, z: 31, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
//     { x: 23, y: 4.5, z: 34, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
//     { x: 25, y: 5, z: 36, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
//     // Cambiamos nuevamente el tamaño y la dirección a partir del undécimo cubo
//     { x: 27, y: 5.5, z: 35, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
//     { x: 29, y: 6, z: 33, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
//     { x: 31, y: 6.5, z: 30, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
//     { x: 33, y: 7, z: 26, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
//     { x: 35, y: 7.5, z: 21, scaleX: 1, scaleY: 0.5, scaleZ: 1 },
//     // Último grupo de plataformas más pequeñas y separadas
//     { x: 37, y: 8, z: 15, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
//     { x: 38, y: 8.5, z: 9, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
//     { x: 39, y: 9, z: 4, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
//     { x: 40, y: 9.5, z: 0, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 },
//     { x: 41, y: 10, z: -3, scaleX: 0.8, scaleY: 0.5, scaleZ: 0.8 }
//   ]

//   // Creamos cada plataforma con posición y tamaño específicos
//   for (let i = 0; i < platforms.length; i++) {
//     const platform = platforms[i]
//     createCube(platform.x, platform.y, platform.z, platform.scaleX, platform.scaleY, platform.scaleZ)
//   }
// }
