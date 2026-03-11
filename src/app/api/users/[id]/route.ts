import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/queries';

/**
 * GET /api/users/[id]
 * Fetch a single user by UUID
 *
 * Learn: This endpoint demonstrates:
 * - Route parameters with [id]
 * - SELECT WHERE clause for filtering by primary key
 * - 404 error handling when user not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(`GET /api/users error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user in PostgreSQL
 *
 * Learn: This endpoint demonstrates:
 * - UPDATE with WHERE clause
 * - Partial updates (only update provided fields)
 * - CURRENT_TIMESTAMP for automatic updated_at
 * - RETURNING to get back updated row
 *
 * Body example (all optional):
 * {
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "phone": "+1 555-5678",
 *   "country": "Canada"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await updateUser(id, body);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(`PUT /api/users error:`, error);

    // Handle PostgreSQL unique constraint violation on email
    if (error instanceof Error && 'code' in error && (error as any).code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user from PostgreSQL
 *
 * Learn: This endpoint demonstrates:
 * - DELETE with WHERE clause
 * - Checking rowCount to verify deletion
 * - Permanent data removal
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteUser(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(`DELETE /api/users error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}





