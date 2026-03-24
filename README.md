# PepsDoc

**API documentation, beautifully automated.**

Modern API documentation framework with a beautiful UI, AI-first workflow, and support for any backend language.

## Install

```bash
npm i @pepshlr/pepdoc
```

## Quick Start (Express)

```typescript
import express from 'express';
import { pepsdoc } from '@pepshlr/pepdoc';

const app = express();

pepsdoc(app, {
  title: 'My API',
  description: 'My awesome API documentation',
});

app.listen(3000);
// Docs available at http://localhost:3000/docs
```

## Quick Start (Any Language)

PepsDoc works with **any backend language** — just generate the JSON files and serve the static build.

```bash
npx pepsdoc init          # Creates pepsdoc/ folder with config
# ... create your JSON doc files in pepsdoc/data/v1/
npx pepsdoc build         # Generates static build
```

Then serve the `pepsdoc/.build/` folder as static files from your backend (Python, Go, Java, Rust, PHP, etc.).

## AI-Powered Documentation

PepsDoc is designed to be documented by AI. After installing, send the AI skill to your AI assistant:

```
Read the PepsDoc AI skill at: node_modules/@pepshlr/pepdoc/templates/ai-skill.md
Then document my backend using PepsDoc.
```

The AI will analyze your code and generate all the documentation automatically.

## Features

- **Beautiful UI** — 3-column layout with sidebar, content, and response examples
- **Dark mode** — Automatic dark theme
- **API versioning** — Support for v1, v2, v3... with status badges (stable, beta, deprecated)
- **Method badges** — Color-coded HTTP method indicators (GET, POST, PUT, DELETE, etc.)
- **Copy for LLM** — One-click copy of endpoint details formatted for AI assistants
- **Search** — Filter endpoints by name or path
- **AI-first** — Built-in skill for AI to auto-document your API
- **Any language** — Works with Node.js, Python, Go, Java, Rust, PHP, and more
- **Git-friendly** — JSON-based storage, easy to version control
- **Zero dependencies** — No database needed, everything stored as JSON files

## JSON Schema

Each endpoint group is a JSON file in `pepsdoc/data/<version>/`:

```json
{
  "group": "Users",
  "order": 1,
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v1/users",
      "summary": "List all users",
      "description": "Returns a paginated list of users.",
      "headers": [
        { "name": "Authorization", "type": "string", "required": true }
      ],
      "queryParams": [
        { "name": "page", "type": "number", "default": "1" }
      ],
      "responses": [
        {
          "status": 200,
          "description": "Success",
          "example": { "data": [{ "id": 1, "name": "John" }] }
        }
      ]
    }
  ]
}
```

## CLI

```bash
npx pepsdoc init            # Initialize pepsdoc/ folder
npx pepsdoc build           # Generate static build
npx pepsdoc export llm      # Export docs as markdown for AI
npx pepsdoc validate        # Validate JSON files
```

## Configuration

Edit `pepsdoc/pepsdoc.config.json`:

```json
{
  "title": "My API",
  "description": "API documentation",
  "basePath": "/docs",
  "versions": [
    { "name": "v1", "badge": "stable", "default": true },
    { "name": "v2", "badge": "beta" }
  ],
  "tabs": [
    { "name": "REST API", "slug": "rest" },
    { "name": "Webhooks", "slug": "webhooks" }
  ]
}
```

## License

MIT
