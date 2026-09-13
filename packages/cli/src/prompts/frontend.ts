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
      { value: 'vue3', label: 'Vue 3', hint: 'Vite + Composition API + Pinia (Recommended)' },
      { value: 'react', label: 'React', hint: 'Vite + React 18/19 + TypeScript' },
      { value: 'nextjs', label: 'Next.js', hint: 'React Fullstack with App Router & SSR' },
      { value: 'nuxt3', label: 'Nuxt 3', hint: 'Vue 3 Fullstack Framework with SSR' },
    ],
    initialValue: 'vue3',
  });

  if (p.isCancel(feType)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const selectedFeatures = await p.multiselect({
    message: 'Select Frontend Features (Press <Space> to toggle, <Enter> to confirm):',
    options: [
      {
        value: 'darkMode',
        label: 'Theme Switcher (Dark / Light Mode)',
        hint: 'Pre-configured CSS variables & toggle button',
      },
      {
        value: 'scss',
        label: 'SCSS Preprocessor',
        hint: 'Pre-configured variables, mixins & modern styling',
      },
      {
        value: 'i18n',
        label: 'Internationalization (i18n / l10n)',
        hint: 'Pre-configured multi-language support (English & Tiếng Việt)',
      },
    ],
    initialValues: ['darkMode', 'scss', 'i18n'],
    required: false,
  });

  if (p.isCancel(selectedFeatures)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const featuresList = selectedFeatures as string[];

  const features: FrontendFeatures = {
    darkMode: featuresList.includes('darkMode'),
    styling: featuresList.includes('scss') ? 'scss' : 'css',
    i18n: featuresList.includes('i18n'),
  };

  return {
    type: feType as FrontendType,
    features,
  };
}
