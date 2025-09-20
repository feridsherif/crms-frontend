import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function GET() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    // Call backend API for roles
    const res = await fetch(`${API_BASE_URL}/admin/roles`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const roles = await res.json();

    return NextResponse.json(roles.data);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
