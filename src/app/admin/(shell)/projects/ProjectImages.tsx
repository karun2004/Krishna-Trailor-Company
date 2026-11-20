'use client'

import { MediaItemsManager, type MediaItem } from './_media/MediaItemsManager'
import { addProjectImage, removeProjectImage, reorderProjectImages, updateProjectImage } from './image-actions'

export function ProjectImages({ projectId, items }: { projectId: string; items: MediaItem[] }) {
  return (
    <MediaItemsManager
      heading="Project images"
      withPhase
      items={items}
      actions={{
        add: (mediaId, phase) => addProjectImage(projectId, mediaId, phase),
        update: updateProjectImage,
        remove: removeProjectImage,
        reorder: reorderProjectImages,
      }}
    />
  )
}
