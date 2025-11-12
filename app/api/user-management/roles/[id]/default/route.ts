import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Role ID is required.' }, { status: 400 });
    }

    // Call backend API to set default role
    const res = await fetch(`${API_BASE_URL}/admin/roles/${id}/default`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (res.status === 404) {
      return NextResponse.json({ message: `Role with ID ${id} not found.` }, { status: 404 });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to set default role' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'Role successfully set as the default.' });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
