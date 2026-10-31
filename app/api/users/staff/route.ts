import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createStaffSchema } from '@/lib/validations/auth';

// Helper: Ensure the caller is an active ADMIN
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

// GET /api/users/staff - List staff (Admin only)
export async function GET() {
  try {
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const { data: staffList, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, phone, is_active, created_at, updated_at')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: staffList || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/users/staff - Create staff (Admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createStaffSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone } = validated.data;
    const adminClient = createAdminClient();

    // Admin creates staff user in Auth
    const { data: newAuthUser, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'staff',
      },
    });

    if (createAuthError || !newAuthUser.user) {
      return NextResponse.json(
        { error: createAuthError?.message || 'Failed to create staff user in auth' },
        { status: 400 }
      );
    }

    // Insert staff profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: newAuthUser.user.id,
        email,
        role: 'staff',
        full_name: fullName,
        phone: phone || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff account created successfully',
      staff: profile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

