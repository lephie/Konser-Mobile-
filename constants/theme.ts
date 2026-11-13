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
  Silver: '#9CA3AF',
};

export const statusConfig = {
  paid: { label: 'Berhasil', color: '#22C55E' },
  pending: { label: 'Menunggu Pembayaran', color: '#EAB308' },
  expired: { label: 'Kedaluwarsa', color: '#EF4444' },
  cancelled: { label: 'Dibatalkan', color: '#9CA3AF' },
} as const;
