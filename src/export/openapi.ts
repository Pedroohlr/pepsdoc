/**
 * PepsDoc - OpenAPI 3.0 Export
 * Converts PepsDoc documentation data to OpenAPI 3.0 specification
 */

import type { PepsDocData, Endpoint, EndpointGroup, ParamField } from '../core/schema';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  servers?: { url: string; description?: string }[];
  paths: Record<string, Record<string, unknown>>;
}

function paramFieldToSchema(field: ParamField): Record<string, unknown> {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
  };
  const schema: Record<string, unknown> = {
    type: typeMap[field.type.toLowerCase()] || 'string',
  };
  if (field.description) schema.description = field.description;
  if (field.default) schema.default = field.default;
  if (field.example) schema.example = field.example;
  return schema;
}

function endpointToOperation(endpoint: Endpoint): Record<string, unknown> {
  const operation: Record<string, unknown> = {
    summary: endpoint.summary,
  };

  if (endpoint.description) operation.description = endpoint.description;
  if (endpoint.deprecated) operation.deprecated = true;
  if (endpoint.tags) operation.tags = endpoint.tags;

  // Parameters (headers, path, query)
  const parameters: Record<string, unknown>[] = [];

  if (endpoint.headers) {
    for (const h of endpoint.headers) {
      parameters.push({
        name: h.name,
        in: 'header',
        required: h.required || false,
        schema: paramFieldToSchema(h),
      });
    }
  }

  if (endpoint.pathParams) {
    for (const p of endpoint.pathParams) {
      parameters.push({
        name: p.name,
        in: 'path',
        required: true,
        schema: paramFieldToSchema(p),
      });
    }
  }

  if (endpoint.queryParams) {
    for (const q of endpoint.queryParams) {
      parameters.push({
        name: q.name,
        in: 'query',
        required: q.required || false,
        schema: paramFieldToSchema(q),
      });
    }
  }

  if (parameters.length > 0) operation.parameters = parameters;

  // Request body
  if (endpoint.body) {
    const contentType = endpoint.body.contentType || 'application/json';
    const bodySchema: Record<string, unknown> = { type: 'object' };

    if (endpoint.body.fields && endpoint.body.fields.length > 0) {
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const f of endpoint.body.fields) {
        properties[f.name] = paramFieldToSchema(f);
        if (f.required) required.push(f.name);
      }

      bodySchema.properties = properties;
      if (required.length > 0) bodySchema.required = required;
    }

    const mediaType: Record<string, unknown> = { schema: bodySchema };
    if (endpoint.body.example) {
      mediaType.example = endpoint.body.example;
    }

    operation.requestBody = {
      required: true,
      content: {
        [contentType]: mediaType,
      },
    };
  }

  // Responses
  const responses: Record<string, unknown> = {};

  if (endpoint.responses && endpoint.responses.length > 0) {
    for (const r of endpoint.responses) {
      const response: Record<string, unknown> = {
        description: r.description || `Response ${r.status}`,
      };

      if (r.example != null) {
        const ct = r.contentType || 'application/json';
        response.content = {
          [ct]: {
            example: r.example,
          },
        };
      }

      responses[String(r.status)] = response;
    }
  } else {
    responses['200'] = { description: 'Successful response' };
  }

  operation.responses = responses;

  return operation;
}

/** Convert PepsDoc path params from :id to {id} format */
function convertPath(path: string): string {
  return path.replace(/:(\w+)/g, '{$1}');
}

/** Export a specific version to OpenAPI 3.0 spec */
export function dataToOpenAPI(data: PepsDocData, versionName?: string): OpenAPISpec {
  const version = versionName
    ? data.versions.find((v) => v.name === versionName)
    : data.versions[0];

  if (!version) {
    return {
      openapi: '3.0.3',
      info: { title: data.config.title, version: 'unknown' },
      paths: {},
    };
  }

  const spec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: data.config.title,
      version: version.name,
    },
    paths: {},
  };

  if (data.config.description) {
    spec.info.description = data.config.description;
  }

  if (data.config.baseUrl) {
    spec.servers = [{ url: data.config.baseUrl }];
  }

  for (const group of version.groups) {
    for (const endpoint of group.endpoints) {
      const openApiPath = convertPath(endpoint.path);
      const method = endpoint.method.toLowerCase();

      if (!spec.paths[openApiPath]) {
        spec.paths[openApiPath] = {};
      }

      const operation = endpointToOperation(endpoint);

      // Add group as tag if no tags specified
      if (!endpoint.tags || endpoint.tags.length === 0) {
        operation.tags = [group.group];
      }

      (spec.paths[openApiPath] as Record<string, unknown>)[method] = operation;
    }
  }

  return spec;
}
