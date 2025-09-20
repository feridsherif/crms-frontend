import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { RoleSchema } from '@/app/(protected)/user-management/roles/forms/role-schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET: Fetch all roles with permissions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    // Call backend API for roles
    const res = await fetch(`${API_BASE_URL}/admin/roles?query=${query}&page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const data = await res.json();

    return NextResponse.json({
      data: data.roles || [],
      pagination: {
        total: data.total || 0,
        page,
      },
      empty: (data.total || 0) === 0,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// POST: Add a new role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = RoleSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    // Call backend API to create role
    const res = await fetch(`${API_BASE_URL}/admin/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(parsedData.data),
    });
    const createdRole = await res.json();

    return NextResponse.json(createdRole, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
