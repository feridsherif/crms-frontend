import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { UserProfileSchema } from '@/app/(protected)/user-management/users/[id]/forms/user-profile-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET: Fetch a specific user by ID, including role
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;

    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (res.status === 404) return NextResponse.json({ message: 'Record not found.' }, { status: 404 });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to fetch user' }, { status: res.status || 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}

// PUT: Edit a specific permission by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });

    const body = await request.json();
    const parsedData = UserProfileSchema.safeParse(body);
    if (!parsedData.success) return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });

    // Prepare payload: backend expects `roleIds` (number[])
    const payload: Record<string, unknown> = { ...parsedData.data };
    if (typeof payload.roleId === 'string' && payload.roleId) {
      payload.roleIds = [Number(payload.roleId)];
      delete payload.roleId;
    }

    // Proxy update to backend
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update user' }, { status: res.status || 500 });
    }

    const data = await res.json();
    return NextResponse.json({ message: 'User profile successfully updated.', user: data }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

    // Proxy delete to backend
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to delete user' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'User successfully deleted.' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}
