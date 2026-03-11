import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/queries';

/**
 * GET /api/users?page=1&limit=10
 * Fetch paginated list of users from PostgreSQL
 *
 * Learn: This endpoint demonstrates:
 * - Query parameters for pagination
 * - SELECT queries with LIMIT/OFFSET
 * - Error handling for database operations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10', 10));

    const result = await getUsers(page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user in PostgreSQL
 *
 * Learn: This endpoint demonstrates:
 * - INSERT with RETURNING to get back created row
 * - Input validation
 * - Handling PostgreSQL constraints (unique email)
 * - Prepared statements to prevent SQL injection
 *
 * Body example:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+1 555-1234",
 *   "country": "USA"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country } = body;

    // Validation - check required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required',
        },
        { status: 400 }
      );
    }

    // Create user in PostgreSQL
    const user = await createUser({
      name,
      email,
      phone: phone || null,
      country: country || null,
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/users error:', error);

    // Handle PostgreSQL unique constraint violation on email
    // Error code 23505 = unique_violation
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
        error: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}


