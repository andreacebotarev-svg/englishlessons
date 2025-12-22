/**
 * Application routes configuration
 * Centralized route definitions with lazy loading
 */

import type { RouteDefinition, EmptyParams, LessonParams } from './types';

/**
 * All application routes
 */
export const routes: RouteDefinition[] = [
  {
    path: '/',
    loader: async () => {
      const { LessonSelectPage } = await import('@/pages/LessonSelectPage');
      return LessonSelectPage;
    },
  },
  {
    path: '/lesson/:id',
    loader: async () => {
      const { LessonTrainerPage } = await import('@/pages/LessonTrainerPage');
      return LessonTrainerPage;
    },
  },
  {
    path: '/results',
    loader: async () => {
      const { ResultsPage } = await import('@/pages/ResultsPage');
      return ResultsPage;
    },
  },
];

/**
 * Route paths (for type-safe navigation)
 */
export const RoutePaths = {
  home: '/',
  lesson: (id: string | number) => `/lesson/${id}`,
  results: '/results',
} as const;
