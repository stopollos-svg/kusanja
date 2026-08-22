import { MoMoProvider } from '../types';

export function formatUGX(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'UGX 0';
  }
  return `UGX ${Math.round(Number(amount)).toLocaleString('en-US')}`;
}

export function formatShortUGX(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'UGX 0';
  }
  const num = Number(amount);
  if (num >= 1000000000) {
    return `UGX ${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `UGX ${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `UGX ${(num / 1000).toFixed(0)}k`;
  }
  return `UGX ${num.toLocaleString()}`;
}

export function detectUgandanProvider(phone?: string | null): MoMoProvider {
  if (!phone || typeof phone !== 'string') {
    return 'mtn';
  }
  const clean = phone.replace(/[^0-9]/g, '');
  
  // Airtel Uganda prefixes: 070, 075, 074, 25670, 25675, 25674
  if (
    clean.startsWith('25670') ||
    clean.startsWith('25675') ||
    clean.startsWith('25674') ||
    clean.startsWith('070') ||
    clean.startsWith('075') ||
    clean.startsWith('074')
  ) {
    return 'airtel';
  }
  
  // MTN Uganda prefixes: 077, 078, 076, 25677, 25678, 25676
  return 'mtn';
}

export function formatPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '256' + clean.slice(1);
  }
  if (clean.startsWith('256') && clean.length === 12) {
    return `+256 ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}

export function timeAgo(dateString?: string | null): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

