import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to restore user' }, { status: res.status || 500 });
    }

    const data = await res.json();
    return NextResponse.json({ message: 'User successfully restored.', user: data }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}
