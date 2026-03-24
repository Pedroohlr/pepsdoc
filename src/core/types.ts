// ============================================
// PepsDoc - Core Types
// Schema completo da documentação
// ============================================

/** Métodos HTTP suportados */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** Status de uma versão da API */
export type VersionBadge = 'stable' | 'beta' | 'deprecated' | 'experimental';

/** Tipos de parâmetros */
export type ParamIn = 'query' | 'path' | 'header' | 'cookie';

// ---- Configuração principal ----

export interface PepsDocConfig {
  /** Nome da API */
  title: string;
  /** Descrição da API */
  description?: string;
  /** Rota onde a documentação vai ser servida (padrão: /docs) */
  basePath?: string;
  /** URL base da API (ex: https://api.meusite.com) */
  baseUrl?: string;
  /** Logo customizado (URL ou path) */
  logo?: string;
  /** Versões da API */
  versions?: VersionConfig[];
  /** Abas customizáveis */
  tabs?: TabConfig[];
  /** Tema customizado */
  theme?: ThemeConfig;
}

export interface VersionConfig {
  /** Nome da versão (ex: v1, v2) */
  name: string;
  /** Badge de status */
  badge?: VersionBadge;
  /** Se é a versão padrão ao abrir */
  default?: boolean;
}

export interface TabConfig {
  /** Nome da aba */
  name: string;
  /** Slug da aba (usado na URL) */
  slug: string;
  /** Ícone da aba (opcional) */
  icon?: string;
}

export interface ThemeConfig {
  /** Cor principal */
  primaryColor?: string;
  /** Forçar tema claro/escuro */
  mode?: 'light' | 'dark' | 'auto';
}

// ---- Schema de Endpoint ----

export interface EndpointParam {
  /** Nome do parâmetro */
  name: string;
  /** Tipo do dado (string, number, boolean, etc.) */
  type: string;
  /** Onde o parâmetro fica */
  in: ParamIn;
  /** Se é obrigatório */
  required?: boolean;
  /** Descrição */
  description?: string;
  /** Valor de exemplo */
  example?: unknown;
  /** Valor padrão */
  default?: unknown;
}

export interface EndpointBody {
  /** Content-Type (padrão: application/json) */
  contentType?: string;
  /** Campos do body */
  fields?: FieldSchema[];
  /** Exemplo completo do body */
  example?: unknown;
}

export interface FieldSchema {
  /** Nome do campo */
  name: string;
  /** Tipo do dado */
  type: string;
  /** Se é obrigatório */
  required?: boolean;
  /** Descrição */
  description?: string;
  /** Valor de exemplo */
  example?: unknown;
  /** Sub-campos (caso seja objeto) */
  children?: FieldSchema[];
}

export interface EndpointResponse {
  /** Status code HTTP */
  status: number;
  /** Descrição da resposta */
  description?: string;
  /** Campos da resposta */
  fields?: FieldSchema[];
  /** Exemplo completo da resposta */
  example?: unknown;
}

export interface Endpoint {
  /** Método HTTP */
  method: HttpMethod;
  /** Path da rota (ex: /api/v1/users/:id) */
  path: string;
  /** Resumo curto */
  summary: string;
  /** Descrição longa (suporta markdown) */
  description?: string;
  /** Parâmetros (query, path, header) */
  params?: EndpointParam[];
  /** Body da requisição */
  body?: EndpointBody;
  /** Respostas possíveis */
  responses?: EndpointResponse[];
  /** Tags para agrupamento adicional */
  tags?: string[];
  /** Se o endpoint requer autenticação */
  auth?: boolean;
  /** Deprecado? */
  deprecated?: boolean;
}

// ---- Schema de Grupo (arquivo JSON) ----

export interface EndpointGroup {
  /** Nome do grupo (ex: Usuários, Autenticação) */
  group: string;
  /** Ícone do grupo */
  icon?: string;
  /** Ordem de exibição na sidebar */
  order?: number;
  /** Aba onde esse grupo aparece (se houver abas) */
  tab?: string;
  /** Descrição do grupo */
  description?: string;
  /** Endpoints do grupo */
  endpoints: Endpoint[];
}

// ---- Dados compilados (para a UI) ----

export interface PepsDocData {
  /** Configuração */
  config: PepsDocConfig;
  /** Grupos organizados por versão */
  versions: Record<string, EndpointGroup[]>;
}
