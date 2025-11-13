import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { deleteFromS3, uploadToS3 } from '@/lib/s3-upload';
import { GeneralSettingsSchema } from '@/app/(protected)/user-management/settings/forms/general-settings-schema';
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

    // Proxy to backend settings endpoint. Forward form data and handle file upload locally if needed.
    const clientIp = getClientIP(request);
    const formData = await request.formData();

    // Build a FormData to forward to backend
    const forward = new FormData();
    for (const key of Array.from(formData.keys())) {
      const value = formData.get(key as string);
      forward.append(key as string, value as any);
    }

    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${(await getServerSession(authOptions))?.accessToken}`,
      },
      body: forward as any,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update settings' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Oops! Something didn't go as planned. Please try again in a moment." +
          error,
      },
      { status: 500 },
    );
  }
}
