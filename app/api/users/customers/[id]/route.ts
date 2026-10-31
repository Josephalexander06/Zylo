import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Staff/Admin can view any customer. Customers can only view their own profile.
    if (callerProfile?.role === 'customer' && user.id !== id) {
      return NextResponse.json({ error: 'Forbidden: Cannot access another customer details' }, { status: 403 });
    }

    const { data: customer, error: customerError } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_name, phone, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Retrieve customer's active subscription count and recent invoice balance
    const { count: subscriptionCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id);

    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id);

    return NextResponse.json({
      customer: {
        ...customer,
        subscriptionCount: subscriptionCount || 0,
        invoiceCount: invoiceCount || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

