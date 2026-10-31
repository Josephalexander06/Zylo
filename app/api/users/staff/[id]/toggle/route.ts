import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify caller is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    // Get current staff status
    const { data: staff, error: fetchError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', id)
      .eq('role', 'staff')
      .single();

    if (fetchError || !staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const newStatus = !staff.is_active;

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isActive: updated.is_active,
      message: `Staff account ${updated.is_active ? 'activated' : 'deactivated'} successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

