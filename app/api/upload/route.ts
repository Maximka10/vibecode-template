import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: 'File too large. Max 50 MB.' }, { status: 413 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const isVideo = file.type.startsWith('video/')
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES

  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${isVideo ? '50' : '20'} MB allowed.` },
      { status: 413 }
    )
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('uploads')
    .upload(path, file, { contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
  return NextResponse.json({ ok: true, url: publicUrl })
}
