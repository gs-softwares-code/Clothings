import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, image, parentId } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    const finalSlug = slug ? slugify(slug) : slugify(name)

    const existing = await db.category.findUnique({
      where: { slug: finalSlug },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    )
  }
}
