import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const body = await request.json();
    const { permissionIds } = body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });
    }

    // Validation: Limit deletion to a maximum of 2 records to ensure a smooth demo experience for users.
    if (permissionIds.length > 2) {
      return NextResponse.json(
        {
          message: 'You cannot delete more than 2 records at once.',
        },
        { status: 400 },
      );
    }

    // Proxy deletes to backend per-id. If your backend supports batch delete, replace with a single call.
    for (const id of permissionIds) {
      const res = await fetch(`${API_BASE_URL}/admin/permissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return NextResponse.json({ message: err?.message || 'Failed to delete selected permissions' }, { status: res.status || 500 });
      }
    }

    return NextResponse.json({ message: 'Delete selected success' });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
