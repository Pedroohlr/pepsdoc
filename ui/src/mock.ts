import type { PepsDocData } from './types';

export const MOCK_DATA: PepsDocData = {
  config: {
    title: 'PepsDoc Demo API',
    description: 'Example API documentation powered by PepsDoc',
    basePath: '/docs',
    baseUrl: 'https://api.example.com',
    versions: [
      { name: 'v1', badge: 'stable', badgeColor: '#22c55e', default: true },
    ],
  },
  versions: [
    {
      name: 'v1',
      badge: 'stable',
      badgeColor: '#22c55e',
      groups: [
        {
          group: 'Authentication',
          icon: 'lock',
          order: 1,
          endpoints: [
            {
              method: 'POST',
              path: '/api/v1/auth/login',
              summary: 'User login',
              description: 'Authenticates a user with email and password. Returns a JWT token for subsequent requests.',
              body: {
                contentType: 'application/json',
                fields: [
                  { name: 'email', type: 'string', required: true, description: 'User email address' },
                  { name: 'password', type: 'string', required: true, description: 'User password' },
                ],
                example: { email: 'john@example.com', password: 'secret123' },
              },
              responses: [
                {
                  status: 200,
                  description: 'Login successful',
                  example: {
                    token: 'eyJhbGciOiJIUzI1NiIs...',
                    user: { id: 1, name: 'John Doe', email: 'john@example.com' },
                  },
                },
                {
                  status: 401,
                  description: 'Invalid credentials',
                  example: { error: 'Invalid email or password' },
                },
              ],
            },
            {
              method: 'POST',
              path: '/api/v1/auth/register',
              summary: 'Register new user',
              description: 'Creates a new user account.',
              body: {
                contentType: 'application/json',
                fields: [
                  { name: 'name', type: 'string', required: true, description: 'Full name' },
                  { name: 'email', type: 'string', required: true, description: 'Email address' },
                  { name: 'password', type: 'string', required: true, description: 'Password (min 8 characters)' },
                ],
                example: { name: 'John Doe', email: 'john@example.com', password: 'secret123' },
              },
              responses: [
                {
                  status: 201,
                  description: 'User created successfully',
                  example: { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01T00:00:00Z' },
                },
                {
                  status: 409,
                  description: 'Email already registered',
                  example: { error: 'Email already in use' },
                },
              ],
            },
          ],
        },
        {
          group: 'Users',
          icon: 'users',
          order: 2,
          endpoints: [
            {
              method: 'GET',
              path: '/api/v1/users',
              summary: 'List all users',
              description: 'Returns a paginated list of users.',
              headers: [
                { name: 'Authorization', type: 'string', required: true, description: 'Bearer token' },
              ],
              queryParams: [
                { name: 'page', type: 'number', required: false, description: 'Page number', default: '1' },
                { name: 'limit', type: 'number', required: false, description: 'Items per page', default: '20' },
              ],
              responses: [
                {
                  status: 200,
                  description: 'Success',
                  example: {
                    data: [
                      { id: 1, name: 'John Doe', email: 'john@example.com' },
                      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
                    ],
                    meta: { page: 1, limit: 20, total: 50 },
                  },
                },
              ],
            },
            {
              method: 'GET',
              path: '/api/v1/users/:id',
              summary: 'Get user by ID',
              description: 'Returns a single user by their ID.',
              headers: [
                { name: 'Authorization', type: 'string', required: true, description: 'Bearer token' },
              ],
              pathParams: [
                { name: 'id', type: 'number', required: true, description: 'User ID' },
              ],
              responses: [
                {
                  status: 200,
                  description: 'Success',
                  example: { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01T00:00:00Z' },
                },
                {
                  status: 404,
                  description: 'User not found',
                  example: { error: 'User not found' },
                },
              ],
            },
            {
              method: 'PUT',
              path: '/api/v1/users/:id',
              summary: 'Update user',
              description: 'Updates user information.',
              headers: [
                { name: 'Authorization', type: 'string', required: true, description: 'Bearer token' },
              ],
              pathParams: [
                { name: 'id', type: 'number', required: true, description: 'User ID' },
              ],
              body: {
                contentType: 'application/json',
                fields: [
                  { name: 'name', type: 'string', required: false, description: 'Full name' },
                  { name: 'email', type: 'string', required: false, description: 'Email address' },
                ],
                example: { name: 'John Updated' },
              },
              responses: [
                {
                  status: 200,
                  description: 'Updated successfully',
                  example: { id: 1, name: 'John Updated', email: 'john@example.com' },
                },
              ],
            },
            {
              method: 'DELETE',
              path: '/api/v1/users/:id',
              summary: 'Delete user',
              description: 'Permanently deletes a user account.',
              headers: [
                { name: 'Authorization', type: 'string', required: true, description: 'Bearer token' },
              ],
              pathParams: [
                { name: 'id', type: 'number', required: true, description: 'User ID' },
              ],
              responses: [
                {
                  status: 204,
                  description: 'Deleted successfully',
                },
                {
                  status: 404,
                  description: 'User not found',
                  example: { error: 'User not found' },
                },
              ],
            },
          ],
        },
        {
          group: 'Products',
          icon: 'package',
          order: 3,
          endpoints: [
            {
              method: 'GET',
              path: '/api/v1/products',
              summary: 'List products',
              description: 'Returns all available products.',
              queryParams: [
                { name: 'category', type: 'string', required: false, description: 'Filter by category' },
                { name: 'search', type: 'string', required: false, description: 'Search by name' },
              ],
              responses: [
                {
                  status: 200,
                  description: 'Success',
                  example: {
                    data: [
                      { id: 1, name: 'Widget Pro', price: 29.99, category: 'tools' },
                      { id: 2, name: 'Gadget X', price: 49.99, category: 'electronics' },
                    ],
                  },
                },
              ],
            },
            {
              method: 'POST',
              path: '/api/v1/products',
              summary: 'Create product',
              description: 'Creates a new product in the catalog.',
              headers: [
                { name: 'Authorization', type: 'string', required: true, description: 'Bearer token (admin only)' },
              ],
              body: {
                contentType: 'application/json',
                fields: [
                  { name: 'name', type: 'string', required: true, description: 'Product name' },
                  { name: 'price', type: 'number', required: true, description: 'Price in USD' },
                  { name: 'category', type: 'string', required: true, description: 'Product category' },
                  { name: 'description', type: 'string', required: false, description: 'Product description' },
                ],
                example: { name: 'New Widget', price: 19.99, category: 'tools', description: 'A great widget' },
              },
              responses: [
                {
                  status: 201,
                  description: 'Product created',
                  example: { id: 3, name: 'New Widget', price: 19.99, category: 'tools' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
