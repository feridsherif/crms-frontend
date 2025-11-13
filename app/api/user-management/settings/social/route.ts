import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { SocialSettingsSchema } from '@/app/(protected)/user-management/settings/forms/social-settings-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const body = await request.json();
    const validationResult = SocialSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input. Please check your data and try again.' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/admin/settings/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify(validationResult.data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update social settings' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'Social settings updated successfully' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
