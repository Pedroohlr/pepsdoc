# PepsDoc — AI Skill

You are tasked with documenting a backend API using the PepsDoc framework.

## What is PepsDoc?

PepsDoc is a documentation framework that stores API docs as JSON files in a `pepsdoc/` folder. These JSON files are rendered into a beautiful, modern documentation UI.

## How it works

1. The project has a `pepsdoc/` folder with:
   - `pepsdoc.config.json` — General configuration
   - `data/<version>/` — Folders for each API version (e.g. `data/v1/`)
   - Inside each version folder: one `.json` file per endpoint group

2. You need to analyze the backend code and generate the JSON files.

## Step-by-step

### 1. Check if PepsDoc is initialized

Look for a `pepsdoc/pepsdoc.config.json` file. If it doesn't exist, run:
```bash
npx pepsdoc init
```

### 2. Read the config

Read `pepsdoc/pepsdoc.config.json` to understand the project setup (title, versions, etc.).

### 3. Analyze the backend code

Scan the backend source code to find:
- All API routes/endpoints
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Route parameters, query parameters
- Request body schemas
- Response schemas and status codes
- Authentication requirements
- Route groupings (by resource/feature)

### 4. Generate the JSON files

For each group of related endpoints (e.g. "Users", "Products", "Auth"), create a JSON file:

**File:** `pepsdoc/data/v1/<group-slug>.json`

**Schema:**
```json
{
  "group": "Group Name",
  "icon": "icon-name",
  "order": 1,
  "endpoints": [
    {
      "method": "GET | POST | PUT | PATCH | DELETE",
      "path": "/api/v1/resource",
      "summary": "Short description",
      "description": "Detailed description of what this endpoint does.",
      "headers": [
        {
          "name": "Authorization",
          "type": "string",
          "required": true,
          "description": "Bearer token"
        }
      ],
      "queryParams": [
        {
          "name": "page",
          "type": "number",
          "required": false,
          "description": "Page number",
          "default": "1"
        }
      ],
      "pathParams": [
        {
          "name": "id",
          "type": "string",
          "required": true,
          "description": "Resource ID"
        }
      ],
      "body": {
        "contentType": "application/json",
        "fields": [
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "User name"
          }
        ],
        "example": {
          "name": "John Doe"
        }
      },
      "responses": [
        {
          "status": 200,
          "description": "Success",
          "example": {
            "id": 1,
            "name": "John Doe"
          }
        },
        {
          "status": 400,
          "description": "Bad request",
          "example": {
            "error": "Invalid input"
          }
        }
      ],
      "tags": ["users"],
      "deprecated": false,
      "notes": [
        {
          "type": "info",
          "title": "Rate limit",
          "content": "This endpoint is rate limited to 100 requests per minute."
        }
      ]
    }
  ]
}
```

### 5. Update the config if needed

If you identify multiple versions or need tabs, update `pepsdoc/pepsdoc.config.json`:

```json
{
  "title": "My API",
  "description": "Complete API documentation",
  "basePath": "/docs",
  "versions": [
    {
      "name": "v1",
      "badge": "stable",
      "badgeColor": "green",
      "default": true
    }
  ],
  "tabs": [
    { "name": "REST API", "slug": "rest" },
    { "name": "Webhooks", "slug": "webhooks" }
  ]
}
```

## Integration with backend

If the backend uses **Node.js** (Express, Fastify, etc.), add PepsDoc to serve the docs:

```typescript
import express from 'express';
import { pepsdoc } from 'pepsdoc';

const app = express();

pepsdoc(app, {
  title: 'My API',
  version: '1.0.0',
});

app.listen(3000);
// Docs available at http://localhost:3000/docs
```

For **non-Node.js backends** (Python, Go, Java, etc.):
- Just generate the JSON files in `pepsdoc/data/`
- Run `npx pepsdoc build` to generate a static build
- Serve the `pepsdoc/.build/` folder as static files from your backend

## Important rules

- One JSON file per endpoint group (e.g. `users.json`, `products.json`)
- Use kebab-case for file names (e.g. `user-settings.json`)
- Always include realistic examples in request body and responses
- Group related endpoints together logically
- Set the `order` field to control sidebar ordering (lower = higher)
- Mark deprecated endpoints with `"deprecated": true`
- Use `notes` to add important information (rate limits, auth requirements, etc.)

## Supported languages

PepsDoc can document APIs written in ANY language. Just analyze the backend code (routes, controllers, handlers) and generate the JSON files following the schema above.

Common backend patterns to look for:
- **Express.js**: `app.get()`, `router.post()`, etc.
- **Fastify**: `fastify.get()`, route schemas
- **NestJS**: `@Get()`, `@Post()` decorators
- **Django/DRF**: `urlpatterns`, `ViewSet`, `@api_view`
- **Flask**: `@app.route()`, `@blueprint.route()`
- **FastAPI**: `@app.get()`, Pydantic models
- **Spring Boot**: `@GetMapping`, `@PostMapping`
- **Gin (Go)**: `r.GET()`, `r.POST()`
- **Actix/Axum (Rust)**: route definitions, handler functions
- **Laravel**: `Route::get()`, controllers
- **Rails**: `resources`, `get`, `post` in routes.rb
