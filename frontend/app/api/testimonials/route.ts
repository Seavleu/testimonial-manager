import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') // 'approved', 'pending', 'rejected'
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,text.ilike.%${search}%`)
    }

    const { data: testimonials, error } = await query

    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      testimonials,
      pagination: {
        limit,
        offset,
        total: testimonials.length
      }
    })

  } catch (error) {
    console.error('Error in testimonials API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, text, rating, category, company, photo, video, allowContact, userId } = body

    if (!name || !text || !userId) {
      return NextResponse.json(
        { error: 'Name, text, and userId are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Handle file uploads if present
    let photoUrl = null
    let videoUrl = null

    if (photo) {
      const photoFileName = `photos/${userId}/${Date.now()}-${photo.name}`
      const { data: photoData, error: photoError } = await supabase.storage
        .from('testimonials')
        .upload(photoFileName, photo)

      if (photoError) {
        console.error('Error uploading photo:', photoError)
        return NextResponse.json(
          { error: 'Failed to upload photo' },
          { status: 500 }
        )
      }

      photoUrl = photoData.path
    }

    if (video) {
      const videoFileName = `videos/${userId}/${Date.now()}-${video.name}`
      const { data: videoData, error: videoError } = await supabase.storage
        .from('testimonials')
        .upload(videoFileName, video)

      if (videoError) {
        console.error('Error uploading video:', videoError)
        return NextResponse.json(
          { error: 'Failed to upload video' },
          { status: 500 }
        )
      }

      videoUrl = videoData.path
    }

    // Insert testimonial
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        name,
        text,
        rating: rating || null,
        category: category || 'general',
        company: company || null,
        photo_url: photoUrl,
        video_url: videoUrl,
        allow_contact: allowContact || false,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json(
        { error: 'Failed to create testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Testimonial submitted successfully',
      testimonial
    }, { status: 201 })

  } catch (error) {
    console.error('Error in testimonial creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, rating, category, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    const updateData: any = {}
    if (status) updateData.status = status
    if (rating) updateData.rating = rating
    if (category) updateData.category = category
    if (notes) updateData.notes = notes

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating testimonial:', error)
      return NextResponse.json(
        { error: 'Failed to update testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Testimonial updated successfully',
      testimonial
    })

  } catch (error) {
    console.error('Error in testimonial update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting testimonial:', error)
      return NextResponse.json(
        { error: 'Failed to delete testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Testimonial deleted successfully'
    })

  } catch (error) {
    console.error('Error in testimonial deletion API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}