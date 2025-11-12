import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { UserAddSchema } from '@/app/(protected)/user-management/users/forms/user-add-schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'name';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const status = searchParams.get('status') || '';
  const roleId = searchParams.get('roleId') || '';

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    // Call backend API for users (use admin paginated endpoint)
    // Backend paginated endpoints in Postman use `page` (0-based) and `size`.
    const backendPage = Math.max(0, page - 1);
    const res = await fetch(
      `${API_BASE_URL}/admin/users/paginated?query=${encodeURIComponent(query)}&roleId=${encodeURIComponent(
        roleId,
      )}&status=${encodeURIComponent(status)}&page=${backendPage}&size=${limit}&sort=${encodeURIComponent(
        sortField,
      )}&dir=${encodeURIComponent(sortDirection)}`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      },
    );

    const raw = await res.json().catch(() => null);
    const pageData = raw?.data ?? raw;
    const items = Array.isArray(pageData?.content)
      ? pageData.content
      : pageData?.data ?? pageData?.users ?? [];

    // Normalize items so each user has an `id` field expected by the UI.
    const normalizedItems = (items || []).map((it: unknown) => {
      const item = it as Record<string, unknown>;
  // Narrow nested shapes safely without `any`
  const nestedUser = item?.user as Record<string, unknown> | undefined;
  const idVal = (item?.id as unknown) ?? (item?.userId as unknown) ?? nestedUser?.id ?? (item?._id as unknown) ?? null;
      const id = idVal !== null && idVal !== undefined ? String(idVal) : undefined;
      return {
        ...(item as Record<string, unknown>),
        id,
      };
    });
    const total = pageData?.totalElements ?? pageData?.total ?? 0;

    return NextResponse.json({
      data: normalizedItems,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = UserAddSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 },
      );
    }

    // Prepare payload for backend: backend expects `roleIds` (number[])
    const payload: Record<string, unknown> = { ...parsedData.data };
    if (typeof payload.roleId === 'string' && payload.roleId) {
      payload.roleIds = [Number(payload.roleId)];
      delete payload.roleId;
    }

    // Call backend API to create user (admin path)
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    return NextResponse.json(
      {
        message: 'User successfully added.',
        user: result,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
