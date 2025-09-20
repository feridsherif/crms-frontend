import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { PermissionSchema } from '@/app/(protected)/user-management/permissions/forms/permission-schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// GET: Fetch all permissions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 0);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    // Call backend API for permissions
    const res = await fetch(`${API_BASE_URL}/admin/permissions/paginated?query=${query}&page=${page}&size=${limit}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const data = await res.json();

    return NextResponse.json({
      data: data.data.content || [],
      pagination: {
        total: data.data.totalElements || 0,
        page,
      },
      empty: (data.data.totalElements || 0) === 0,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// POST: Add a new permission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = PermissionSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    // Call backend API to create permission
    const res = await fetch(`${API_BASE_URL}/admin/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(parsedData.data),
    });
    const newPermission = await res.json();

    return NextResponse.json(newPermission);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
