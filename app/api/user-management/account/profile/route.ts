import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { deleteFromS3, uploadToS3 } from '@/lib/s3-upload';
import { AccountProfileSchema } from '@/app/(protected)/user-management/account/forms/account-profile-schema';
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

    const clientIp = getClientIP(request);
    const formData = await request.formData();

    const forward = new FormData();
    for (const key of Array.from(formData.keys())) {
      forward.append(key as string, formData.get(key as string) as any);
    }

    const res = await fetch(`${API_BASE_URL}/account/profile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
      body: forward as any,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update profile' }, { status: res.status || 500 });
    }

    const json = await res.json().catch(() => null);
    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
