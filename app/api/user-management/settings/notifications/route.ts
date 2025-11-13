import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { NotificationSettingsSchema } from '@/app/(protected)/user-management/settings/forms/notification-settings-schema';
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
    const parsedData = NotificationSettingsSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ message: 'Invalid input. Please check your data and try again.' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/admin/settings/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify(parsedData.data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update notification settings' }, { status: res.status || 500 });
    }

    const json = await res.json().catch(() => null);
    return NextResponse.json({ message: 'Notification settings updated successfully', data: json }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: 'An error occurred while updating the notification settings.',
      },
      { status: 500 },
    );
  }
}
