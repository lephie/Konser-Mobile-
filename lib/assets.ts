const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.100.130:5000/api';

// Backend stores "/uploads/layouts/<uuid>.jpg"; build an absolute URL for <Image>.
export const assetUrl = (p?: string | null) =>
  !p ? '' : /^https?:\/\//.test(p) ? p : `${API_URL.replace(/\/api\/?$/, '')}${p}`;