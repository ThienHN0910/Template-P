export const vueMessages = {
  en: {
    welcome: 'Full-stack starter project',
    subtitle: 'Built with Template-P',
    backendStatus: 'Backend status',
    items: 'Database items',
    addItem: 'Add item',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    loading: 'Loading data...',
    healthy: 'Connected and healthy',
  },
  vi: {
    welcome: 'Dự án full-stack khởi tạo',
    subtitle: 'Được tạo bằng Template-P',
    backendStatus: 'Trạng thái backend',
    items: 'Dữ liệu từ cơ sở dữ liệu',
    addItem: 'Thêm mục',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    loading: 'Đang tải dữ liệu...',
    healthy: 'Đã kết nối và hoạt động ổn định',
  },
} as const;

export function renderVueI18nModule(): string {
  return `import { createI18n } from 'vue-i18n';\n\nconst messages = ${JSON.stringify(vueMessages, null, 2)};\n\nexport const i18n = createI18n({\n  legacy: false,\n  locale: 'en',\n  fallbackLocale: 'en',\n  messages,\n});\n`;
}
