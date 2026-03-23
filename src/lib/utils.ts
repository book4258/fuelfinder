/**
 * lib/utils.ts
 * Shared utility functions.
 */

import type { Station, FuelType } from '@/types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Human-readable relative time in Thai (no date-fns dependency) */
export function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60)  return 'เมื่อกี้';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

/** Haversine distance in km */
export function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortByDistance(
  stations: Station[],
  lat: number,
  lng: number,
): Station[] {
  return [...stations].sort((a, b) =>
    distanceKm(lat, lng, a.lat, a.lng) - distanceKm(lat, lng, b.lat, b.lng)
  );
}

export function confidenceColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

export function availableCount(station: Station): number {
  return Object.values(station.fuels).filter(f => f?.available).length;
}

export const BRAND_COLORS: Record<string, string> = {
  PTT:      '#E31837',
  Shell:    '#D4A000',
  Caltex:   '#009A44',
  Bangchak: '#004B87',
  Esso:     '#003087',
  Susco:    '#FF6B00',
};

export function brandColor(brand: string): string {
  return BRAND_COLORS[brand] ?? '#6B7280';
}

export function runOutProbability(station: Station): number {
  const ageHours   = (Date.now() - station.updatedAt) / 3_600_000;
  const reportRate = station.reportCount / Math.max(1, ageHours);
  return Math.min(100, Math.round(
    (reportRate * 10) + ((100 - station.confidence) * 0.5) + (ageHours * 2)
  ));
}
