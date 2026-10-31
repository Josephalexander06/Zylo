import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName, companyName, phone } = validatedData.data;
    const supabase = await createClient();

    // Sign up customer using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer', // Customer self-registration always assigns 'customer'
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User registration failed.' }, { status: 500 });
    }

    // Insert user profile into public.profiles table
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: authData.user.email!,
      role: 'customer',
      full_name: fullName,
      company_name: companyName || null,
      phone: phone || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'customer',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

