import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { RoleSchema } from '@/app/(protected)/user-management/roles/forms/role-schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET: Fetch a specific role by ID, including permissions
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const { id } = await params;

    const res = await fetch(`${API_BASE_URL}/admin/roles/${id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (res.status === 404) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json(
        { message: err?.message || 'Failed to fetch role' },
        { status: res.status || 500 },
      );
    }

    const data = await res.json();

    // Ensure permissions are in flat array if backend nests them
    const permissions = data.permissions || [];

    return NextResponse.json({ ...data, permissions });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// PUT: Edit a specific role by ID
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const { params } = context;
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const body = await request.json();
    const parsedData = RoleSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ message: 'Invalid input. Please check your data and try again.' }, { status: 400 });
    }

    // Translate frontend `permissions` (string[] of ids) to backend `permissionIds` (number[])
    const payload: Record<string, unknown> = { ...parsedData.data };
    if (Array.isArray((payload as Record<string, unknown>).permissions)) {
      const perms = (payload as Record<string, unknown>).permissions as unknown as Array<string | number>;
      const permissionIds = perms.map((p) => Number(p));
      (payload as Record<string, unknown>).permissionIds = permissionIds;
      // remove frontend field
      delete (payload as Record<string, unknown>).permissions;
    }

    // Call backend API to update role
    const res = await fetch(`${API_BASE_URL}/admin/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update role' }, { status: res.status || 500 });
    }

    const updated = await res.json();
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a specific role by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    // Call backend API to delete role
    const res = await fetch(`${API_BASE_URL}/admin/roles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (res.status === 404) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to delete role' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
