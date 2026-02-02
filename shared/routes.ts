import { z } from 'zod';
import { insertVocabularySchema, insertResultSchema, vocabularies, results, users } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  vocabularies: {
    list: {
      method: 'GET' as const,
      path: '/api/vocabularies',
      input: z.object({
        grade: z.string().optional(),
        unit: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof vocabularies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/vocabularies/:id',
      responses: {
        200: z.custom<typeof vocabularies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vocabularies',
      input: insertVocabularySchema,
      responses: {
        201: z.custom<typeof vocabularies.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/vocabularies/bulk',
      input: z.array(insertVocabularySchema),
      responses: {
        201: z.array(z.custom<typeof vocabularies.$inferSelect>()),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.object({
          username: z.string(),
          score: z.number(),
          createdAt: z.string().or(z.date()),
        })),
      },
    },
  },
  results: {
    create: {
      method: 'POST' as const,
      path: '/api/results',
      input: insertResultSchema.pick({ score: true }),
      responses: {
        201: z.custom<typeof results.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
