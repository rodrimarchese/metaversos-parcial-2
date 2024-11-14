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

// Constante para el color azul marino oscuro
const MARINE_BLUE = Color4.fromHexString('#000a78') // Azul marino oscuro

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
  Material.setPbrMaterial(entity, {
    albedoColor: MARINE_BLUE,
    metallic: 0.2,
    roughness: 0.8
  })

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
  roundness: number = 0.1 // Factor de redondeo (0.1 = poco redondeado, 0.5 = muy redondeado)
): Entity {
  const entity = engine.addEntity()

  Transform.create(entity, {
    position: { x, y, z },
    scale: {
      x: scaleX * (1 + roundness),
      y: scaleY * (1 + roundness),
      z: scaleZ * (1 + roundness)
    }
  })

  MeshRenderer.setSphere(entity)
  MeshCollider.setBox(entity)
  Material.setPbrMaterial(entity, {
    albedoColor: MARINE_BLUE,
    metallic: 0.2,
    roughness: 0.8
  })

  createCharacter({
    model: 'robot-hello',
    position: Vector3.create(x + 0.5, y + 1.3, z + 0.5),
    scale: Vector3.create(0.4, 0.4, 0.4),
    message: checkpointMessage
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
      setCheckpoint(x, y + 1, z)
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
  alwaysVisible?: boolean
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
  VisibilityComponent.create(characterEntity, { visible: true })

  MeshCollider.setBox(characterEntity)

  addDialog(characterEntity, !!args.alwaysVisible, args.message)

  return characterEntity
}

// Función para crear objetos recolectables
export function createCollectible(id: string, model: string, position: Vector3, scale?: Vector3): Collectible {
  const entity: Entity = engine.addEntity()

  GltfContainer.create(entity, {
    src: `models/${model}.glb`
  })

  Transform.create(entity, {
    position: position,
    scale: scale || Vector3.create(0.65, 0.65, 0.65) // Ajusta la escala para que se vea bien
  })

  Spinner.create(entity, { speed: 100 })

  // Agregar el objeto a la lista de recolectables
  return { id, entity }
}

function addDialog(characterEntity: Entity, alwaysVisible: boolean, message?: string) {
  if (!message) return

  const plane = engine.addEntity()
  MeshRenderer.setPlane(plane)
  VisibilityComponent.create(plane, { visible: true })
  Billboard.create(plane, { billboardMode: BillboardMode.BM_ALL })
  Transform.create(plane, {
    position: Vector3.create(5, 3, 2),
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
    const visibilityRobotCharacter = VisibilityComponent.getMutable(characterEntity)

    if (distance < 8) {
      visibilityPlane.visible = true
      visibilitySign.visible = true
      visibilityRobotCharacter.visible = true
    } else {
      visibilityPlane.visible = false
      visibilitySign.visible = false
      if (!alwaysVisible)
        visibilityRobotCharacter.visible = false
    }
  })
}

export function createPortal(getCheckpoint: () => { x: number; y: number; z: number }) {
  console.log('Creating portal')

  const portal = engine.addEntity()
  Transform.create(portal, {
    position: Vector3.create(-9, 2, 16),
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

  const plane = engine.addEntity()
  MeshRenderer.setPlane(plane)
  VisibilityComponent.create(plane, { visible: true })
  Billboard.create(plane, { billboardMode: BillboardMode.BM_ALL })
  Transform.create(plane, {
    position: Vector3.create(1, 0.3, 0),
    parent: portal,
    scale: { x: 1, y: 0.2, z: 1.5 }
  })

  const sign = engine.addEntity()
  VisibilityComponent.create(sign, { visible: true })
  Transform.create(sign, {
    position: Vector3.create(0, 0.2, -0.3),
    parent: plane,
    rotation: Quaternion.create(0, 0, 0),
    scale: { x: 1, y: 1.5, z: 1 }
  })
  TextShape.create(sign, {
    text: "Ir al Checkpoint",
    textColor: { r: 0, g: 0, b: 0, a: 1 },
    fontSize: 1,
    font: Font.F_SANS_SERIF,
    textWrapping: true
  })


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

// Constantes para los colores
// quiero el marine blue un poco mas oscuro
const DARK_MARINE_BLUE = Color4.fromHexString('#000a78') // Azul marino oscuro
const WHITE = Color4.fromHexString('#FFFFFF') // Blanco

export function createRoundedCube(
  x: number,
  y: number,
  z: number,
  scaleX: number = 1,
  scaleY: number = 0.5,
  scaleZ: number = 1,
  roundness: number = 0.1 // Factor de redondeo (0.1 = poco redondeado, 0.5 = muy redondeado)
): Entity {
  const entity = engine.addEntity()

  Cube.create(entity)

  Transform.create(entity, {
    position: { x, y, z },
    scale: {
      x: scaleX * (1 + roundness),
      y: scaleY * (1 + roundness),
      z: scaleZ * (1 + roundness)
    }
  })

  // Alternamos entre celeste y blanco usando el índice de la posición
  const isMarineBlue = Math.round(x + z) % 2 === 0
  const color = isMarineBlue ? DARK_MARINE_BLUE : WHITE

  MeshRenderer.setSphere(entity)
  MeshCollider.setBox(entity)
  Material.setPbrMaterial(entity, {
    albedoColor: color,
    metallic: 0.2, // Añadimos un poco de brillo metálico
    roughness: 0.8 // Hacemos la superficie un poco más suave
  })

  return entity
}

export function createWall(
  x: number,
  y: number,
  z: number,
  width: number = 10,
  height: number = 5,
  depth: number = 0.5
): Entity {
  const entity = engine.addEntity()

  Transform.create(entity, {
    position: { x, y, z },
    scale: { x: width, y: height, z: depth }
  })

  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)
  Material.setPbrMaterial(entity, {
    albedoColor: MARINE_BLUE,
    metallic: 0.2,
    roughness: 0.8
  })

  const logoLtm = engine.addEntity()
  Transform.create(logoLtm, {
    position: Vector3.create(-5.5, 2.5, -0.3),
    scale: Vector3.create(3.5, 4, -1.5)
  })
  MeshRenderer.setPlane(logoLtm)

  Material.setPbrMaterial(logoLtm, {
    texture: Material.Texture.Common({
      src: 'images/logo-ltm.png'
    })
  })



  return entity
}
