import {
  engine,
  Transform,
  inputSystem,
  PointerEvents,
  InputAction,
  PointerEventType,
  Material,
  GltfContainer,
  Entity,
  UiText,
  PointerEventsResult,
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { Cube, RobotNPC, Spinner } from './components'
import { getRandomHexColor } from './utils'
import { Collectible } from '.'


/**
 * All cubes rotating behavior
 */
export function circularSystem(dt: number) {
  const entitiesWithSpinner = engine.getEntitiesWith(Spinner, Transform)
  for (const [entity, _spinner, _transform] of entitiesWithSpinner) {
    const mutableTransform = Transform.getMutable(entity)
    const spinnerData = Spinner.get(entity)

    mutableTransform.rotation = Quaternion.multiply(
      mutableTransform.rotation,
      Quaternion.fromAngleAxis(dt * spinnerData.speed, Vector3.Up())
    )
  }
}

/**
 * Search for the cubes that has pointerEvents, and when there is a click change the color.
 */
export function changeColorSystem() {
  for (const [entity] of engine.getEntitiesWith(Cube, PointerEvents)) {
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, entity)) {
      Material.setPbrMaterial(entity, { albedoColor: Color4.fromHexString(getRandomHexColor()) })
    }
  }
}

// Handles the collectibles logic
export function collectiblesSystem(collectibles: Collectible[], collectedSet: Set<string>) {
  // Obtener la posición del jugador
  const playerEntity = engine.PlayerEntity
  const playerTransform = Transform.get(playerEntity)
  const playerPosition = playerTransform.position

  // Iterar sobre los objetos recolectables
  for (const collectible of collectibles) {
    // Verificar si ya ha sido recolectado
    if (collectedSet.has(collectible.id)) {
      continue // Saltar si ya fue recolectado
    }

    const transform = Transform.get(collectible.entity)
    const distanceSquared = Vector3.distanceSquared(transform.position, playerPosition)

    // Umbral de distancia (por ejemplo, 2 unidades)
    const threshold = 2

    // Comparar con el cuadrado del umbral
    if (distanceSquared < threshold * threshold) {
      console.log(`Recolectado ${collectible.id} en`, transform.position)
      engine.removeEntity(collectible.entity)
      collectedSet.add(collectible.id)

      // Verificar si se han recolectado todos los objetos
      if (collectedSet.size === collectibles.length) {
        // Llamar a la función que spawnea algo y muestra un mensaje
        allCollectiblesCollected()
      }
    }
  }
}

// Handle NPC interaction
export function npcInteractionSystem(targetEntity: Entity, onTrigger: () => void) {
  for (const [entity] of engine.getEntitiesWith(PointerEventsResult)) {
    const pointerEvents = PointerEventsResult.get(entity)
    for (const event of pointerEvents) {
      if (
        event.button === InputAction.IA_POINTER &&
        event.state === PointerEventType.PET_DOWN &&
        entity === targetEntity
      ) {
        onTrigger() // Mostrar el diálogo al interactuar con el personaje
      }
    }
  }
}

export function robotNpcFacePlayerSystem() {
  const playerEntity = engine.PlayerEntity
  const playerTransform = Transform.get(playerEntity)
  const playerPosition = playerTransform.position

  for (const [entity] of engine.getEntitiesWith(RobotNPC)) {
    const robotTransform = Transform.getMutable(entity)
    const lookAtPosition = Vector3.subtract(playerPosition, robotTransform.position)
    lookAtPosition.y = 0 // Mantener la rotación en el plano XZ
    robotTransform.rotation = Quaternion.lookRotation(lookAtPosition, Vector3.Up())
  }
}

function allCollectiblesCollected() {
  console.log('¡Has recolectado todos los objetos!')

  // Mostrar mensaje de felicitaciones en la UI
  const messageEntity = engine.addEntity()

  UiText.create(messageEntity, {
    value: `🎉 ¡Felicidades! Has recolectado todos los objetos. 🎉`,
    fontSize: 50,
    color: Color4.Yellow()
  })

  let elapsedTime = 0

  function removeMessageSystem(dt: number) {
    elapsedTime += dt
    if (elapsedTime >= 3) {
      // Cuando hayan pasado 3 segundos
      engine.removeEntity(messageEntity) // Eliminar el mensaje
      engine.removeSystem(removeMessageSystem) // Remover este sistema
    }
  }

  engine.addSystem(removeMessageSystem)

  // Añadir el aguacate encima del jugador
  addAvocadoHat()
}

function addAvocadoHat() {
  const playerEntity = engine.PlayerEntity

  // Crear una nueva entidad para el aguacate
  const avocadoHatEntity: Entity = engine.addEntity()

  // Agregar el modelo del aguacate
  GltfContainer.create(avocadoHatEntity, {
    src: 'models/avocado.glb',
    invisibleMeshesCollisionMask: 0
  })

  // Configurar la posición, escala y establecer el padre en el Transform
  Transform.create(avocadoHatEntity, {
    position: Vector3.create(0, 0.7, -0.25), // Ajusta la posición vertical según sea necesario
    scale: Vector3.create(0.5, 0.5, 0.5), // Ajusta la escala para que se vea bien
    parent: playerEntity // Establecer el jugador como entidad padre
  })
}
