export const colors = {
  bg: '#131313',
  card: '#1a1a1a',
  card2: '#272727',
  border: '#333333',
  primary: '#FBADCC',
  primaryPressed: '#f8a0c4',
  magenta: '#E21D8F',
  magenta2: '#F551B5',
  text: '#FFFFFF',
  muted: '#A1A1AA',
  dim: '#6B7280',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
};

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const tierColors: Record<string, string> = {
  VIP: '#A855F7',
  Gold: '#F59E0B',
  Silver: '#a0b5da',
  Platinum : '#a0b5da',
};

export const statusConfig = {
  paid: { label: 'Berhasil', color: '#22C55E' },
  pending: { label: 'Menunggu Pembayaran', color: '#EAB308' },
  expired: { label: 'Kedaluwarsa', color: '#EF4444' },
  cancelled: { label: 'Dibatalkan', color: '#8d0000' },
} as const;

const TIER_PALETTE = ['#A855F7', '#F59E0B', '#22C55E', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#EAB308'];

export const getTierColor = (name?: string, id?: number | string) => {
  if (name && tierColors[name]) return tierColors[name];      // VIP / Gold / Silver keep their colors
  const key = String(id ?? name ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return TIER_PALETTE[Math.abs(hash) % TIER_PALETTE.length];
};