import * as p from '@clack/prompts';
import pc from 'picocolors';
import { FrontendType, FrontendFeatures } from '../types.js';

export interface FrontendResult {
  type: FrontendType;
  features: FrontendFeatures;
}

export async function promptFrontend(): Promise<FrontendResult> {
  const feType = await p.select({
    message: 'Select your Frontend Framework:',
    options: [
      { value: 'vue3', label: 'Vue 3', hint: 'Vite + Official Ecosystem (TypeScript, Router, Pinia, ESLint...)' },
      { value: 'react', label: 'React', hint: 'Vite + React 18/19 (TypeScript, Router, Zustand, ESLint...)' },
      { value: 'nextjs', label: 'Next.js', hint: 'Official App Router with Tailwind & next-themes' },
      { value: 'nuxt3', label: 'Nuxt 3', hint: 'Vue 3 Fullstack SSR Framework' },
    ],
    initialValue: 'vue3',
  });

  if (p.isCancel(feType)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const framework = feType as FrontendType;
  let optionsList: Array<{ value: string; label: string; hint?: string }> = [];
  let defaultValues: string[] = [];

  if (framework === 'vue3') {
    optionsList = [
      { value: 'ts', label: 'TypeScript', hint: 'Strict typechecking support' },
      { value: 'router', label: 'Vue Router', hint: 'Single Page Application routing' },
      { value: 'pinia', label: 'Pinia', hint: 'State management store' },
      { value: 'eslint', label: 'ESLint', hint: 'Code quality linter' },
      { value: 'prettier', label: 'Prettier', hint: 'Code formatter' },
      { value: 'vitest', label: 'Vitest', hint: 'Unit testing framework' },
      { value: 'darkMode', label: 'Theme Switcher (Dark / Light)', hint: '60fps GPU-accelerated theme toggle' },
      { value: 'scss', label: 'SCSS Preprocessor', hint: 'Variables, mixins & nested styling' },
      { value: 'i18n', label: 'Internationalization (i18n)', hint: 'Pre-configured English and Vietnamese' },
    ];
    defaultValues = ['ts', 'router', 'pinia', 'eslint', 'prettier', 'darkMode', 'scss', 'i18n'];
  } else if (framework === 'react') {
    optionsList = [
      { value: 'ts', label: 'TypeScript', hint: 'Strict typing' },
      { value: 'router', label: 'React Router', hint: 'Client-side navigation' },
      { value: 'zustand', label: 'Zustand', hint: 'Lightweight state management' },
      { value: 'eslint', label: 'ESLint + Prettier', hint: 'Linting and formatting' },
      { value: 'vitest', label: 'Vitest', hint: 'Unit testing' },
      { value: 'darkMode', label: 'Theme Switcher (Dark / Light)', hint: '60fps theme context' },
      { value: 'scss', label: 'SCSS Preprocessor', hint: 'SCSS styling' },
      { value: 'i18n', label: 'Internationalization (i18next)', hint: 'English and Vietnamese' },
    ];
    defaultValues = ['ts', 'router', 'zustand', 'eslint', 'darkMode', 'scss', 'i18n'];
  } else if (framework === 'nextjs') {
    optionsList = [
      { value: 'ts', label: 'TypeScript', hint: 'Strict typing' },
      { value: 'app', label: 'App Router', hint: 'Modern Next.js directory' },
      { value: 'eslint', label: 'ESLint', hint: 'Next.js core web vitals linter' },
      { value: 'tailwind', label: 'Tailwind CSS', hint: 'Utility-first CSS' },
      { value: 'darkMode', label: 'Theme Switcher (next-themes)', hint: 'Dark/Light mode' },
      { value: 'i18n', label: 'Internationalization (next-intl)', hint: 'Localization support' },
    ];
    defaultValues = ['ts', 'app', 'eslint', 'tailwind', 'darkMode', 'i18n'];
  } else {
    optionsList = [
      { value: 'ts', label: 'TypeScript', hint: 'Strict typing' },
      { value: 'darkMode', label: '@nuxtjs/color-mode', hint: 'Dark/Light mode' },
      { value: 'i18n', label: '@nuxtjs/i18n', hint: 'Multi-language' },
    ];
    defaultValues = ['ts', 'darkMode', 'i18n'];
  }

  const selectedFeatures = await p.multiselect({
    message: `Select ${framework.toUpperCase()} Features (Press <Space> to toggle, <Enter> to confirm):`,
    options: optionsList,
    initialValues: defaultValues,
    required: false,
  });

  if (p.isCancel(selectedFeatures)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const list = selectedFeatures as string[];

  const features: FrontendFeatures = {
    typescript: list.includes('ts'),
    router: list.includes('router') || list.includes('app'),
    stateManagement: list.includes('pinia') ? 'pinia' : list.includes('zustand') ? 'zustand' : 'none',
    linter: list.includes('eslint') ? 'eslint' : 'none',
    prettier: list.includes('prettier'),
    vitest: list.includes('vitest'),
    darkMode: list.includes('darkMode'),
    styling: list.includes('tailwind') ? 'tailwind' : list.includes('scss') ? 'scss' : 'css',
    i18n: list.includes('i18n'),
  };

  return {
    type: framework,
    features,
  };
}
