import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { queryClient } from '../lib/queryClient';
import { router } from './router';
import '../index.css';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Light `m` components only (strict throws on the full `motion.*`). reducedMotion "user"
          skips transform animations for people who ask for less motion (DESIGN.md §5). */}
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  </StrictMode>,
);
