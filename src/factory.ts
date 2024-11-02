import {
  Entity,
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  PointerEvents,
  PointerEventType,
  InputAction,
  Material,
  GltfContainer,
  TextShape,
  Font,
  VisibilityComponent,
  Billboard,
  BillboardMode,
  Animator
} from '@dcl/sdk/ecs'
import { Cube, Portal, RobotNPC, Spinner } from './components'
import * as utils from '@dcl-sdk/utils'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { getRandomHexColor } from './utils'
import { Collectible } from '.'
import { movePlayerTo } from '~system/RestrictedActions'

// Cube factory
// Modificamos createCube para aceptar escala
export function createCube(
  x: number,
  y: number,
  z: number,
  scaleX: number = 1,
  scaleY: number = 0.5,
  scaleZ: number = 1
): Entity {
  const entity = engine.addEntity()

  // Usado para rastrear los cubos
  Cube.create(entity)

  Transform.create(entity, {
    position: { x, y, z },
    scale: { x: scaleX, y: scaleY, z: scaleZ }
  })

  // Configuramos cómo se ve y colisiona el cubo
  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)
  Material.setPbrMaterial(entity, { albedoColor: Color4.fromHexString(getRandomHexColor()) })

  // Make the cube spin, with the circularSystem
  // Spinner.create(entity, { speed: 100 * Math.random() })

  // Create PointerEvent with the hover feedback.
  // We are going to check the onClick event on the changeColorSystem.
  // PointerEvents.create(entity, {
  //   pointerEvents: [
  //     { eventType: PointerEventType.PET_DOWN, eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Change Color' } }
  //   ]
  // })

  return entity
}

export function createCheckpoint(
  x: number,
  y: number,
  z: number,
  scaleX: number,
  scaleY: number,
  scaleZ: number,
  checkpointMessage: string,
  setCheckpoint: (x: number, y: number, z: number) => void,
): Entity {
  const entity = engine.addEntity()

  Transform.create(entity, {
    position: { x, y, z },
    scale: { x: scaleX, y: scaleY, z: scaleZ }
  })

  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)
  // Aplicamos un color distintivo para los checkpoints
  Material.setPbrMaterial(entity, { albedoColor: Color4.fromHexString('#FFD700') }) // Dorado

  createCharacter({
    model: 'robot-hello',
    position: Vector3.create(x + 0.5, y + 1.3, z + 0.5),
    scale: Vector3.create(0.4, 0.4, 0.4),
    message: checkpointMessage,
  })

  utils.triggers.addTrigger(
    entity,
    utils.NO_LAYERS,
    1,
    [
      {
        type: 'box',
        scale: Vector3.create(1.5, 3, 1.5)
      }
    ],
    () => {

      setCheckpoint(x,y + 1,z)
    }
  )

  return entity
}

interface CreateNpcRobotArgs {
  model: string
  position: Vector3
  scale?: Vector3
  message?: string
  parent?: Entity
}

// Función para crear el personaje
export function createCharacter(args: CreateNpcRobotArgs): Entity {
  const characterEntity: Entity = engine.addEntity()

  RobotNPC.create(characterEntity)

  GltfContainer.create(characterEntity, {
    src: `models/${args.model}.glb`
  })

  Transform.create(characterEntity, {
    position: args.position,
    scale: args.scale || Vector3.create(1, 1, 1),
    parent: args.parent
  })

  MeshCollider.setBox(characterEntity)

  addDialog(characterEntity, args.message)

  return characterEntity
}

// Función para crear objetos recolectables
export function createCollectible(id: string, model: string, position: Vector3): Collectible {
  const entity: Entity = engine.addEntity()

  GltfContainer.create(entity, {
    src: `models/${model}.glb`
  })

  Transform.create(entity, {
    position: position,
    scale: Vector3.create(0.65, 0.65, 0.65) // Ajusta la escala para que se vea bien
  })

  Spinner.create(entity, { speed: 100 })

  // Agregar el objeto a la lista de recolectables
  return { id, entity }
}

function addDialog(characterEntity: Entity, message?: string) {
  if (!message) return

  const plane = engine.addEntity()
  MeshRenderer.setPlane(plane)
  VisibilityComponent.create(plane, { visible: true })
  Billboard.create(plane, { billboardMode: BillboardMode.BM_ALL })
  Transform.create(plane, {
    position: Vector3.create(4, 3, 1),
    parent: characterEntity,
    scale: { x: 7, y: 4, z: 10 }
  })

  const sign = engine.addEntity()
  VisibilityComponent.create(sign, { visible: true })
  Transform.create(sign, {
    position: Vector3.create(0, 0, -0.3),
    parent: plane,
    rotation: Quaternion.create(0, 0, 0),
    scale: { x: 0.7, y: 0.9, z: 0.9 }
  })
  TextShape.create(sign, {
    text: message,
    textColor: { r: 0, g: 0, b: 0, a: 1 },
    fontSize: 1,
    font: Font.F_SANS_SERIF,
    textWrapping: true
  })

  engine.addSystem(function () {
    const playerEntity = engine.PlayerEntity
    const playerTransform = Transform.get(playerEntity)
    const playerPosition = playerTransform.position
    const npcPosition = Transform.get(characterEntity).position

    const distance = Vector3.distance(playerPosition, npcPosition)
    const visibilityPlane = VisibilityComponent.getMutable(plane)
    const visibilitySign = VisibilityComponent.getMutable(sign)

    if (distance < 5) {
      visibilityPlane.visible = true
      visibilitySign.visible = true
    } else {
      visibilityPlane.visible = false
      visibilitySign.visible = false
    }
  })
}

export function createPortal(getCheckpoint: () => { x: number, y: number, z: number }) {
  console.log('Creating portal');
  
  const portal = engine.addEntity()
  Transform.create(portal, {
    position: Vector3.create(-10, 2, -5),
    scale: Vector3.create(3, 4, 1)
  })
  MeshRenderer.setSphere(portal)
  Animator.create(portal, {
    states: [{ clip: 'Expand', loop: false, shouldReset: true, playing: true }]
  })
  GltfContainer.create(portal, {
    src: 'models/portalOrange.glb'
  })

  Portal.create(portal)

  //trigger
  utils.triggers.addTrigger(
    portal,
    utils.NO_LAYERS,
    1,
    [
      {
        type: 'box',
        scale: Vector3.create(1.5, 3, 1.5)
      }
    ],
    () => {
      movePlayerTo({ newRelativePosition: getCheckpoint() })
    }
  )
}
