import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BranchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;
    const res = await fetch(`${API_BASE_URL}/branches/${id}`, { headers: { Authorization: `Bearer ${session.accessToken}` } });

    if (res.status === 404) return NextResponse.json({ message: 'Record not found.' }, { status: 404 });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to fetch branch' }, { status: res.status || 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = BranchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });

    const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to update branch' }, { status: res.status || 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });

    const { id } = await params;
    const res = await fetch(`${API_BASE_URL}/branches/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json({ message: err?.message || 'Failed to delete branch' }, { status: res.status || 500 });
    }

    return NextResponse.json({ message: 'Branch successfully deleted.' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Oops! Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}
