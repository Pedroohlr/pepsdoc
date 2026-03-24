export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface ParamField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string;
  example?: string;
}

export interface RequestBody {
  contentType?: string;
  fields?: ParamField[];
  example?: unknown;
}

export interface ResponseDefinition {
  status: number;
  description?: string;
  contentType?: string;
  fields?: ParamField[];
  example?: unknown;
}

export interface Note {
  type: 'info' | 'warning' | 'tip' | 'danger';
  title?: string;
  content: string;
}

export interface Endpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tab?: string;
  headers?: ParamField[];
  queryParams?: ParamField[];
  pathParams?: ParamField[];
  body?: RequestBody;
  responses?: ResponseDefinition[];
  notes?: Note[];
  deprecated?: boolean;
  tags?: string[];
}

export interface EndpointGroup {
  group: string;
  icon?: string;
  order?: number;
  endpoints: Endpoint[];
}

export interface VersionConfig {
  name: string;
  badge?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  badgeColor?: string;
  default?: boolean;
}

export interface TabConfig {
  name: string;
  slug: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  logo?: string;
  darkMode?: boolean;
}

export interface PepsDocConfig {
  title: string;
  description?: string;
  basePath?: string;
  baseUrl?: string;
  versions?: VersionConfig[];
  tabs?: TabConfig[];
  theme?: ThemeConfig;
}

export interface VersionData {
  name: string;
  badge?: string;
  badgeColor?: string;
  groups: EndpointGroup[];
}

export interface PepsDocData {
  config: PepsDocConfig;
  versions: VersionData[];
}
