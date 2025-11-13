import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { PermissionSchema, PermissionSchemaType } from '@/app/(protected)/user-management/permissions/forms/permission-schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET: Fetch a specific permission by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;

    // Proxy to backend
    const res = await fetch(`${API_BASE_URL}/admin/permissions/${id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Record not found.' }, { status: res.status || 404 });
    }

    const json = await res.json();
    // backend may wrap response in data
    const item = json?.data ?? json;
    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// PUT: Edit a specific permission by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsedData = PermissionSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { name, description }: PermissionSchemaType = parsedData.data;

    // Proxy update to backend
    const res = await fetch(`${API_BASE_URL}/admin/permissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update permission' }, { status: res.status || 500 });
    }

    const json = await res.json();
    const item = json?.data ?? json;
    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a specific permission by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;
    // Proxy delete to backend
    const res = await fetch(`${API_BASE_URL}/admin/permissions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to delete permission' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'Permission deleted successfully.' });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
