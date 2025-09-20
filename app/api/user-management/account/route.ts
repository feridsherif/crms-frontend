import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function GET() {
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    // Fetch the user from backend API using session info
    const res = await fetch(`${API_BASE_URL}/users/account?email=${session.user.email}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const user = await res.json();

    if (!user) {
      return NextResponse.json({ message: 'Record not found. Someone might have deleted it already.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
