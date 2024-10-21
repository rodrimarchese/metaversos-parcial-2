// npc.ts
import {
  engine,
  Entity,
  GltfContainer,
  Transform,
  PointerEvents,
  PointerEventType,
  InputAction,
  PointerEventsResult
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { showDialogUI } from './ui'

export let characterEntity: Entity

export function createCharacter(id: string, model: string, position: Vector3) {
  characterEntity = engine.addEntity()

  GltfContainer.create(characterEntity, {
    src: `models/${model}.glb`
  })

  Transform.create(characterEntity, {
    position: position
  })

  // Añadir eventos de puntero al personaje
  PointerEvents.create(characterEntity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          hoverText: 'Hablar',
          maxDistance: 10,
          showFeedback: true
        }
      }
    ]
  })
}

export function characterInteractionSystem() {
  for (const [entity] of engine.getEntitiesWith(PointerEventsResult)) {
    const pointerEvents = PointerEventsResult.get(entity)
    for (const event of pointerEvents) {
      if (
        event.button === InputAction.IA_POINTER &&
        event.state === PointerEventType.PET_DOWN &&
        entity === characterEntity
      ) {
        showDialogUI()
      }
    }
  }
}
