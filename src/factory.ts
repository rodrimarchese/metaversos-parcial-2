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
} from '@dcl/sdk/ecs'
import { Cube, RobotNPC, Spinner } from './components'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { getRandomHexColor } from './utils'

// Cube factory
export function createCube(x: number, y: number, z: number, spawner = true): Entity {
  const entity = engine.addEntity()

  // Used to track the cubes
  Cube.create(entity)

  Transform.create(entity, { position: { x, y, z } })

  // set how the cube looks and collides
  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)
  Material.setPbrMaterial(entity, { albedoColor: Color4.fromHexString(getRandomHexColor()) })

  // Make the cube spin, with the circularSystem
  Spinner.create(entity, { speed: 100 * Math.random() })

  // Create PointerEvent with the hover feedback.
  // We are going to check the onClick event on the changeColorSystem.
  PointerEvents.create(entity, {
    pointerEvents: [
      { eventType: PointerEventType.PET_DOWN, eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Change Color' } }
    ]
  })

  return entity
}

// Función para crear el personaje
export function createCharacter(model: string, position: Vector3, scale?: Vector3, message?: string): Entity {
  const characterEntity: Entity = engine.addEntity()

  RobotNPC.create(characterEntity)

  GltfContainer.create(characterEntity, {
    src: `models/${model}.glb`
  })

  Transform.create(characterEntity, {
    position: position,
    scale: scale || Vector3.create(1, 1, 1)
  })

  MeshCollider.setBox(characterEntity)

  // Añadir eventos de puntero al personaje
  PointerEvents.create(characterEntity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER, // Botón izquierdo del ratón
          hoverText: 'Hablar',
          maxDistance: 15,
          showFeedback: true
        }
      }
    ]
  })

  addDialog(characterEntity, message)

  return characterEntity
}

// Función para crear objetos recolectables
export function createCollectible(id: string, model: string, position: Vector3): { id: string, entity: Entity } {
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
    scale: { x: 5, y: 4, z: 10 },
  })

  const sign = engine.addEntity()
  VisibilityComponent.create(sign, { visible: true })
  Transform.create(sign, {
    position: Vector3.create(0, 0, -0.3),
    parent: plane,
    rotation: Quaternion.create(0, 0, 0),
  })
  TextShape.create(sign, {
    text: message,
    textColor: { r: 0, g: 0, b: 0, a: 1 },
    fontSize: 1,
    font: Font.F_SANS_SERIF,
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