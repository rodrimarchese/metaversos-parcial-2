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
import {
  createCharacter,
  createCheckpoint,
  createCollectible,
  createCube,
  createLandingPlatform,
  createPortal,
  createRoundedCube,
  createWall
} from './factory'

// Definir una interfaz para los objetos recolectables
export interface Collectible {
  id: string
  entity: Entity
}

let currentCheckpoint = { x: 0, y: 0, z: 0 }
function setCheckpoint(x: number, y: number, z: number) {
  console.log('Checkpoint reached at', x, y, z)
  currentCheckpoint = { x, y, z }
}
function getCheckpoint() {
  return currentCheckpoint
}

let currentRobotNumber = 0
export const setRobotNumber = (robotNumber: number) => {
  currentRobotNumber = robotNumber
}
export const getRobotNumber = () => {
  return currentRobotNumber
}

// Lista de todos los objetos recolectables
let collectibles: Collectible[] = []

// Conjunto de identificadores de objetos recolectados
let collectedSet: Set<string> = new Set()

function addCollectible(collectible: Collectible) {
  collectibles.push(collectible)
}

export function main() {
  // Agregar la pared inicial
  createWall(
    -7, // x - posición en el centro
    2.5, // y - altura (la mitad de la altura total)
    0, // z - un poco delante del punto de inicio
    10, // width - ancho de la pared
    5, // height - altura de la pared
    0.5 // depth - grosor de la pared
  )

  let characterEntity: Entity

  // Crear el NPC
  characterEntity = createCharacter({
    model: 'robot-hello',
    position: Vector3.create(-9, 1, -2),
    scale: Vector3.create(0.4, 0.4, 0.4),
    message: 'Perdí mis computadoras! Podés ayudarme a encontrarlas?',
    robotNumber: 0,
    getCurrentRobotNumber: getRobotNumber,
  })

  createPortal(getCheckpoint)

  createParkourPath(addCollectible)

  // Agregar systems
  engine.addSystem(() => collectiblesSystem(collectibles, collectedSet))
  engine.addSystem(() => npcInteractionSystem(characterEntity, showDialogUI))
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)
  engine.addSystem(robotNpcFacePlayerSystem)

  setupUi()


  createCharacter({
    model: 'robot-hello',
    position: Vector3.create(-4, 1, 2.5),
    scale: Vector3.create(0.4, 0.4, 0.4),
    message:
      'Felicidades por tu trabajo! Ya podés escanear el QR para entrar a LTM Software para visitarnos!',
    robotNumber: 5,
    alwaysVisible: false,
    getCurrentRobotNumber: getRobotNumber
  })

}


function createParkourPath(addCollectible: (collectible: Collectible) => void) {
  // Definimos las posiciones y tamaños de las plataformas con checkpoints
  const platforms = [
    // Primer grupo de 5 plataformas
    { x: 2, y: 0.5, z: 2, scaleX: 2, scaleY: 0.5, scaleZ: 2, isTrigger: true, nextPlatform: 1 },
    { x: 5, y: 1, z: 4, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 8, y: 1.5, z: 7, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 11, y: 2, z: 11, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    { x: 14, y: 2.5, z: 16, scaleX: 2, scaleY: 0.5, scaleZ: 2 },
    // Checkpoint después del primer grupo
    {
      x: 17,
      y: 3,
      z: 20,
      scaleX: 5,
      scaleY: 0.5,
      scaleZ: 5,
      isCheckpoint: true,
      collectible: { id: 'pc1', model: 'pc' },
      checkpointMessage: '¡Encontraste la primera!\n¡Seguí adelante!'
    },
    // Segundo grupo de 5 plataformas con orientación diferente
    { x: 14, y: 3.5, z: 24, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5, isTrigger: true, nextPlatform: 2 },
    { x: 11, y: 4, z: 28, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 8, y: 4.5, z: 31, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 5, y: 5, z: 33, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    { x: 2, y: 5.5, z: 34, scaleX: 1.5, scaleY: 0.5, scaleZ: 1.5 },
    // Checkpoint después del segundo grupo
    {
      x: -1,
      y: 6,
      z: 35,
      scaleX: 5,
      scaleY: 0.5,
      scaleZ: 5,
      isCheckpoint: true,
      collectible: { id: 'pc2', model: 'pc' },
      checkpointMessage: '¡Vamos por la segunda!\n¡Queda poco!'
    },
    // Tercer grupo de 5 plataformas con cambio de dirección
    { x: -4, y: 6.5, z: 32, scaleX: 1.4, scaleY: 0.5, scaleZ: 1.4, isTrigger: true, nextPlatform: 3 },
    { x: -7, y: 7, z: 29, scaleX: 1.4, scaleY: 0.5, scaleZ: 1.4 },
    { x: -10, y: 7.5, z: 25, scaleX: 1.4, scaleY: 0.5, scaleZ: 1.4 },
    { x: -13, y: 8, z: 20, scaleX: 1.4, scaleY: 0.5, scaleZ: 1.4 },
    { x: -16, y: 8.5, z: 15, scaleX: 1.4, scaleY: 0.5, scaleZ: 1.4 },
    // Checkpoint después del tercer grupo
    {
      x: -19,
      y: 9,
      z: 8,
      scaleX: 5,
      scaleY: 0.5,
      scaleZ: 5,
      isCheckpoint: true,
      collectible: { id: 'pc3', model: 'pc' },
      checkpointMessage: '¡Encontraste todas las computadoras!\n¡Ahora podés acceder a nuestra página!'
    }
  ]

  const robotCoordinatesInPath = {
    1: { x: 17.5, y: 4.3, z: 20.5 },
    2: { x: -0.5, y: 7.3, z: 35.5 },
    3: { x: -18.5, y: 10.3, z: 8.5 }
  }

  // Creamos cada plataforma con posición y tamaño específicos
  let currentCheckpointRobot = 1
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i]
  
    // Si es un checkpoint, aplicamos un material diferente
    if (platform.isCheckpoint) {
      createCheckpoint(
        platform.x,
        platform.y,
        platform.z,
        platform.scaleX,
        platform.scaleY,
        platform.scaleZ,
        platform.checkpointMessage || '¡Checkpoint!',
        currentCheckpointRobot,
        getRobotNumber,
        setCheckpoint,
      )
      currentCheckpointRobot++
      if (platform.collectible)
        addCollectible(
          createCollectible(
            platform.collectible.id,
            platform.collectible.model,
            Vector3.create(platform.x - 1, platform.y + 0.8, platform.z + 1),
            Vector3.create(3, 3, 3)
          )
        )
    } else {
      // createCube(platform.x, platform.y, platform.z, platform.scaleX, platform.scaleY, platform.scaleZ)
      createRoundedCube(platform.x, platform.y, platform.z, platform.scaleX, platform.scaleY, platform.scaleZ, platform.isTrigger, platform.nextPlatform, setRobotNumber)
    }
  }
}
