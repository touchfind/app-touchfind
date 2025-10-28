import {redirect} from 'next/navigation';
import {supabaseServer} from '@/lib/supabase/server';

export default async function ParceiroPage() {
  const supabase = supabaseServer();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const {data: perfil} = await supabase
    .from('usuarios')
    .select('id, nome, email, tipo')
    .eq('auth_user_id', user.id)
    .single();

  if (!perfil) redirect('/login');

  if (perfil.tipo === 'admin') redirect('/admin');
  if (perfil.tipo !== 'parceiro') redirect('/dashboard');

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Área do Parceiro</h1>
      <p className="text-sm text-gray-500 mt-2">Bem-vindo, {perfil.nome || perfil.email}.</p>
      <a className="underline mt-4 inline-block" href="/logout">Terminar sessão</a>
      {/* TODO: ferramentas de parceiro */}
    </main>
  );
}