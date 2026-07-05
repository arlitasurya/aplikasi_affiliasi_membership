
import { MenuItem, Voucher } from './types';

const CENTRAL_BACKEND_URL = 'http://localhost:4000';

const getEnv = (key: string) =>
  (import.meta as any).env?.[key] || (globalThis as any).process?.env?.[key];

export const API_BASE_URL =
  getEnv('REACT_APP_API_BASE_URL') ||
  getEnv('VITE_API_BASE_URL') ||
  getEnv('VITE_BACKEND_URL') ||
  getEnv('VITE_CENTRAL_API_URL') ||
  CENTRAL_BACKEND_URL;

export const MOCK_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Mie Ayam Yamin Spesial',
    price: 25000,
    pointCost: 2500,
    image: 'https://picsum.photos/seed/yamin/400/300',
    description: 'Mie kenyal dengan bumbu yamin manis gurih dan topping ayam melimpah.',
    category: 'FOOD',
    isAvailable: true
  },
  {
    id: 'm2',
    name: 'Bakso Urat Granat',
    price: 30000,
    pointCost: 3000,
    image: 'https://picsum.photos/seed/bakso/400/300',
    description: 'Bakso urat besar dengan isian daging cincang pedas.',
    category: 'FOOD',
    isAvailable: true
  },
  {
    id: 'm3',
    name: 'Es Teh Manis Jumbo',
    price: 5000,
    pointCost: 500,
    image: 'https://picsum.photos/seed/esteh/400/300',
    description: 'Kesegaran es teh manis dalam ukuran jumbo.',
    category: 'DRINK',
    isAvailable: true
  },
  {
    id: 'm4',
    name: 'Es Jeruk Peras',
    price: 12000,
    pointCost: 1200,
    image: 'https://picsum.photos/seed/orange/400/300',
    description: 'Jeruk peras asli tanpa pemanis buatan.',
    category: 'DRINK',
    isAvailable: true
  }
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    title: 'Diskon Akhir Pekan',
    code: 'WEEKEND20',
    discount: '20%',
    minSpend: 50000,
    expiry: '2024-12-31',
    isClaimed: false,
    image: 'https://picsum.photos/seed/v1/200/200',
    pointCost: 1000 // Menambahkan harga poin untuk tes
  },
  {
    id: 'v2',
    title: 'Cashback Point Mantap',
    code: 'POINTS5K',
    discount: '5.000 Poin',
    minSpend: 30000,
    expiry: '2024-11-30',
    isClaimed: true,
    image: 'https://picsum.photos/seed/v2/200/200',
    pointCost: 0
  }
];

export const GAMIFICATION_LINK = 'https://example-game.com';
export const KIOSK_LINK = 'https://example-kiosk.com';
