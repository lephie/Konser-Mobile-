export const formatRupiah = (n: number) =>
  'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};
export const formatTime = (iso: string) =>
  `${String(new Date(iso).getHours()).padStart(2, '0')}.${String(new Date(iso).getMinutes()).padStart(2, '0')} WIB`;
