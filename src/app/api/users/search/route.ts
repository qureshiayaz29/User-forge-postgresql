import { NextRequest, NextResponse } from 'next/server';
import { searchUsers } from '@/lib/queries';

/**
 * GET /api/users/search?q=search_term&page=1&limit=10
 * Search users by name or email using ILIKE (case-insensitive)
 *
 * Learn: This endpoint demonstrates:
 * - ILIKE for case-insensitive pattern matching
 * - OR condition to search multiple columns
 * - Pagination with search results
 * - Query parameter validation
 *
 * Example requests:
 * /api/users/search?q=john - finds users with "john" in name or email
 * /api/users/search?q=@gmail - finds users with @gmail in email
 * /api/users/search?q=usa&page=2 - page 2 of search results
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10', 10));

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      );
    }

    const result = await searchUsers(query, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/users/search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search users',
      },
      { status: 500 }
    );
  }
}

