import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateStaffSchema } from '@/lib/validations/auth';

async function verifyAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return null;
  }

  return user;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const { data: staff, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, phone, is_active, created_at, updated_at')
      .eq('id', id)
      .eq('role', 'staff')
      .single();

    if (error || !staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ staff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateStaffSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { fullName, phone, isActive } = validated.data;

    const updatePayload: Record<string, any> = {
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    };

    if (typeof isActive === 'boolean') {
      updatePayload.is_active = isActive;
    }

    const { data: staff, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .eq('role', 'staff')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

