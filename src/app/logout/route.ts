import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url));
}