// Tipos para as tabelas do banco de dados

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'parceiro' | 'cliente';
  created_at: string;
}

export interface Pulseira {
  id: string;
  identificador: string;
  cliente_id: string | null;
  created_at: string;
}

export interface PulseiraDadosSos {
  id: string;
  pulseira_id: string;
  nome?: string | null;
  foto?: string | null;
  data_nascimento?: string | null;
  contactos?: Array<{ prefixo: string; numero: string }>;
  alergias?: string | null;
  condicoes_saude?: string | null;
  medicacao_horarios?: string | null;
  instrucoes_rapidas?: string | null;
  idiomas_falados?: string | null;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SosCampo {
  id: string;
  pulseira_id: string;
  rotulo: string;
  valor: string;
  ordem: number;
  created_at: string;
}

// Tipos para criação (sem campos auto-gerados)
export interface CreatePulseira {
  identificador: string;
  cliente_id?: string | null;
}

export interface CreatePulseiraDadosSos {
  pulseira_id: string;
  nome?: string;
  foto?: string;
  data_nascimento?: string;
  contactos?: Array<{ prefixo: string; numero: string }>;
  alergias?: string;
  condicoes_saude?: string;
  medicacao_horarios?: string;
  instrucoes_rapidas?: string;
  idiomas_falados?: string;
  observacoes?: string;
}

export interface CreateSosCampo {
  pulseira_id: string;
  rotulo: string;
  valor: string;
  ordem?: number;
}

// Tipos para atualização (campos opcionais)
export interface UpdatePulseira {
  identificador?: string;
  cliente_id?: string | null;
}

export interface UpdatePulseiraDadosSos {
  nome?: string;
  foto?: string;
  data_nascimento?: string;
  contactos?: Array<{ prefixo: string; numero: string }>;
  alergias?: string;
  condicoes_saude?: string;
  medicacao_horarios?: string;
  instrucoes_rapidas?: string;
  idiomas_falados?: string;
  observacoes?: string;
}

export interface UpdateSosCampo {
  rotulo?: string;
  valor?: string;
  ordem?: number;
}

// Tipos com relacionamentos
export interface PulseiraComCliente extends Pulseira {
  cliente?: Usuario | null;
}

export interface PulseiraComDados extends Pulseira {
  dados_sos?: PulseiraDadosSos | null;
}

export interface SosCampoComPulseira extends SosCampo {
  pulseira?: Pulseira;
}

export interface PulseiraCompleta extends Pulseira {
  cliente?: Usuario | null;
  dados_sos?: PulseiraDadosSos | null;
  sos_campos?: SosCampo[];
}