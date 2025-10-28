import {redirect} from 'next/navigation';
import {createSupabaseClient} from '@/lib/supabase';

export default async function Home() {
  const supabase = createSupabaseClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const {data: perfil} = await supabase
    .from('usuarios')
    .select('tipo')
    .eq('auth_user_id', user.id)
    .single();

  if (!perfil) redirect('/login');
  if (perfil.tipo === 'admin') redirect('/admin');
  if (perfil.tipo === 'parceiro') redirect('/parceiro');
  redirect('/dashboard');
}