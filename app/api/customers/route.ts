import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sort = searchParams.get('sort') || '';
    const dir = searchParams.get('dir') || 'asc';
    const query = searchParams.get('query') || '';

    const params = new URLSearchParams({
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(sort ? { sort, dir } : {}),
      ...(query ? { query } : {}),
    });

    const res = await fetch(`${API_BASE_URL}/customers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to fetch customers' }, { status: res.status || 500 });
    }

    const json = await res.json();
    const items = Array.isArray(json) ? json : json?.data ?? [];

    // attempt to read pagination info
    const total = json?.totalElements ?? json?.pagination?.total ?? items.length;
    const currentPage = Number(page) || 1;

    return NextResponse.json({ data: items, empty: items.length === 0, pagination: { total, page: currentPage } });
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to create customer' }, { status: res.status || 500 });
    }

    const data = await res.json();
    const item = data?.data ?? data;
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}
