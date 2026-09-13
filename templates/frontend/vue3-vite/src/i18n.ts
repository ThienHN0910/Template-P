import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    welcome: 'Fullstack Starter Template',
    subtitle: 'High-Performance Vue 3 + Backend Architecture',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    backendStatus: 'Backend Status',
    items: 'Items from Backend Database',
    addItem: 'Add Item',
    loading: 'Loading...',
    healthy: 'Connected & Healthy',
  },
  vi: {
    welcome: 'Bộ Khung Mẫu Fullstack Toàn Năng',
    subtitle: 'Kiến trúc Vue 3 + Backend hiệu năng cao',
    darkMode: 'Chế độ Tối',
    lightMode: 'Chế độ Sáng',
    language: 'Ngôn ngữ',
    backendStatus: 'Trạng thái Backend',
    items: 'Dữ liệu từ Cơ sở dữ liệu',
    addItem: 'Thêm mới',
    loading: 'Đang tải dữ liệu...',
    healthy: 'Kết nối ổn định',
  },
};

export const i18n = createI18n({
  legacy: false,
  locale: 'vi',
  fallbackLocale: 'en',
  messages,
});
