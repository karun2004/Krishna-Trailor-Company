'use client'

import { MediaItemsManager, type MediaItem } from '../projects/_media/MediaItemsManager'
import { addAlbumMedia, removeAlbumMedia, reorderAlbumMedia, updateAlbumMedia } from './media-actions'

export function AlbumMedia({ albumId, items }: { albumId: string; items: MediaItem[] }) {
  return (
    <MediaItemsManager
      heading="Album images and videos"
      withPhase={false}
      items={items}
      actions={{
        add: (mediaId) => addAlbumMedia(albumId, mediaId),
        update: (id, v) => updateAlbumMedia(id, { caption: v.caption }),
        remove: removeAlbumMedia,
        reorder: reorderAlbumMedia,
      }}
    />
  )
}
