import { NextRequest, NextResponse } from 'next/server'

const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024  // 50 MB

export async function POST(req: NextRequest) {
  const contentLength = parseInt(req.headers.get('content-length') ?? '0')
  const contentType = req.headers.get('content-type') ?? ''

  const isVideo = contentType.startsWith('video/')
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

  if (contentLength > maxSize) {
    return NextResponse.json(
      { error: `Файл слишком большой. Максимум: ${isVideo ? '50' : '20'} МБ` },
      { status: 413 }
    )
  }

  return NextResponse.json({ ok: false, error: 'Upload not yet configured' }, { status: 501 })
}
