/**
 * lib/firestore.ts
 * All Firestore read/write operations.
 * Uses Firebase v10 modular SDK.
 */

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc,
  query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  Timestamp, type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Station, Report, AppUser, FuelType, ReportStatus, MapFilters } from '@/types';

// ─── Collection references ────────────────────────────────────────────────────
const stationsCol = () => collection(db, 'stations');
const reportsCol  = () => collection(db, 'reports');
const usersCol    = () => collection(db, 'users');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toStation(id: string, d: DocumentData): Station {
  return {
    id,
    name:        d.name        ?? '',
    brand:       d.brand       ?? '',
    address:     d.address     ?? '',
    province:    d.province    ?? '',
    lat:         d.location?.latitude  ?? d.lat  ?? 0,
    lng:         d.location?.longitude ?? d.lng  ?? 0,
    fuels:       d.fuels       ?? {},
    phone:       d.phone,
    openHours:   d.openHours,
    confidence:  d.confidence  ?? 50,
    reportCount: d.reportCount ?? 0,
    featured:    d.featured    ?? false,
    createdAt:   (d.createdAt  as Timestamp)?.toMillis() ?? Date.now(),
    updatedAt:   (d.updatedAt  as Timestamp)?.toMillis() ?? Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getStations(filters?: MapFilters): Promise<Station[]> {
  try {
    let q = query(stationsCol(), orderBy('updatedAt', 'desc'), limit(200));

    if (filters?.province) {
      q = query(stationsCol(), where('province', '==', filters.province), limit(200));
    }

    const snap = await getDocs(q);
    let stations = snap.docs.map(d => toStation(d.id, d.data()));

    if (filters?.fuelType) {
      stations = stations.filter(s =>
        filters.available
          ? s.fuels[filters.fuelType!]?.available === true
          : filters.fuelType! in s.fuels
      );
    }

    return stations;
  } catch (err) {
    console.warn('getStations error (using demo data):', err);
    return DEMO_STATIONS.map((s, i) => ({ ...s, id: `demo-${i}` }));
  }
}

export function subscribeToStation(id: string, cb: (s: Station) => void) {
  return onSnapshot(doc(db, 'stations', id), snap => {
    if (snap.exists()) cb(toStation(snap.id, snap.data()));
  }, (err) => {
    console.warn('subscribeToStation error:', err);
    // Fall back to demo data if id matches
    const demo = DEMO_STATIONS.find((_, i) => `demo-${i}` === id);
    if (demo) cb({ ...demo, id });
  });
}

export async function getStation(id: string): Promise<Station | null> {
  try {
    const snap = await getDoc(doc(db, 'stations', id));
    if (snap.exists()) return toStation(snap.id, snap.data());
    // Check demo data
    const demoIdx = parseInt(id.replace('demo-', ''));
    if (!isNaN(demoIdx) && DEMO_STATIONS[demoIdx]) {
      return { ...DEMO_STATIONS[demoIdx], id };
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateStationFuel(
  stationId: string,
  fuelType:  FuelType,
  available: boolean,
  price?:    number,
) {
  try {
    const ref = doc(db, 'stations', stationId);
    await updateDoc(ref, {
      [`fuels.${fuelType}.available`]: available,
      [`fuels.${fuelType}.updatedAt`]: Date.now(),
      ...(price !== undefined ? { [`fuels.${fuelType}.price`]: price } : {}),
      updatedAt:   serverTimestamp(),
      reportCount: increment(1),
    });
  } catch (err) {
    console.warn('updateStationFuel error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export async function submitReport(data: {
  stationId: string;
  userId:    string;
  fuelType:  FuelType;
  status:    ReportStatus;
  price?:    number;
  note?:     string;
}): Promise<string> {
  try {
    const ref = await addDoc(reportsCol(), {
      ...data,
      upvotes:   0,
      downvotes: 0,
      timestamp: Date.now(),
    });

    await updateStationFuel(
      data.stationId,
      data.fuelType,
      data.status === 'available',
      data.price,
    );

    await incrementUserTrust(data.userId, 2);
    return ref.id;
  } catch (err) {
    console.warn('submitReport error:', err);
    return 'demo-report-id';
  }
}

export async function voteReport(
  reportId: string,
  userId:   string,
  vote:     'up' | 'down',
) {
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      [vote === 'up' ? 'upvotes' : 'downvotes']: increment(1),
    });
  } catch (err) {
    console.warn('voteReport error:', err);
  }
}

export async function getStationReports(stationId: string): Promise<Report[]> {
  try {
    const snap = await getDocs(
      query(reportsCol(),
        where('stationId', '==', stationId),
        orderBy('timestamp', 'desc'),
        limit(10),
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getOrCreateUser(uid: string, data: Partial<AppUser>): Promise<AppUser> {
  try {
    const ref  = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) return { uid, ...snap.data() } as AppUser;

    const newUser: Omit<AppUser, 'uid'> = {
      displayName:  data.displayName ?? 'ผู้ใช้ใหม่',
      email:        data.email       ?? '',
      photoURL:     data.photoURL,
      trustScore:   50,
      reportCount:  0,
      isPremium:    false,
      bookmarks:    [],
      createdAt:    Date.now(),
    };

    await setDoc(ref, newUser);
    return { uid, ...newUser };
  } catch (err) {
    console.warn('getOrCreateUser error:', err);
    return {
      uid,
      displayName:  data.displayName ?? 'ผู้ใช้ใหม่',
      email:        data.email       ?? '',
      photoURL:     data.photoURL,
      trustScore:   50,
      reportCount:  0,
      isPremium:    false,
      bookmarks:    [],
      createdAt:    Date.now(),
    };
  }
}

export async function incrementUserTrust(userId: string, points: number) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      trustScore:  increment(Math.min(points, 5)),
      reportCount: increment(1),
    });
  } catch (err) {
    console.warn('incrementUserTrust error:', err);
  }
}

export async function toggleBookmark(userId: string, stationId: string, add: boolean) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      bookmarks: add ? arrayUnion(stationId) : arrayRemove(stationId),
    });
  } catch (err) {
    console.warn('toggleBookmark error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO / SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMO_STATIONS: Omit<Station, 'id'>[] = [
  {
    name: 'ปตท. หัวหิน สาขา 1', brand: 'PTT', province: 'ประจวบคีรีขันธ์',
    address: 'ถ.เพชรเกษม หัวหิน', lat: 12.5706, lng: 99.9580,
    phone: '032-511111', openHours: '24 ชั่วโมง',
    fuels: {
      diesel:    { available: true,  price: 29.94, updatedAt: Date.now() - 600000 },
      gasohol91: { available: true,  price: 36.86, updatedAt: Date.now() - 600000 },
      gasohol95: { available: false, price: 40.10, updatedAt: Date.now() - 1800000 },
      e20:       { available: true,  price: 33.44, updatedAt: Date.now() - 600000 },
    },
    confidence: 87, reportCount: 23, featured: true,
    createdAt: Date.now(), updatedAt: Date.now() - 600000,
  },
  {
    name: 'Shell ประจวบฯ', brand: 'Shell', province: 'ประจวบคีรีขันธ์',
    address: 'ถ.เพชรเกษม กม.278', lat: 12.5480, lng: 99.9400,
    phone: '032-522222', openHours: '06:00–22:00',
    fuels: {
      diesel:    { available: true,  price: 30.05, updatedAt: Date.now() - 300000 },
      gasohol95: { available: true,  price: 40.55, updatedAt: Date.now() - 300000 },
      e20:       { available: false, price: 33.90, updatedAt: Date.now() - 900000 },
      e85:       { available: true,  price: 22.38, updatedAt: Date.now() - 300000 },
      lpg:       { available: true,  updatedAt: Date.now() - 300000 },
    },
    confidence: 92, reportCount: 41, featured: false,
    createdAt: Date.now(), updatedAt: Date.now() - 300000,
  },
  {
    name: 'Bangchak กรุงเทพฯ ลาดพร้าว', brand: 'Bangchak', province: 'กรุงเทพมหานคร',
    address: 'ลาดพร้าว 71 กรุงเทพฯ', lat: 13.7890, lng: 100.6100,
    phone: '02-123-4567', openHours: '24 ชั่วโมง',
    fuels: {
      diesel:    { available: true,  price: 29.89, updatedAt: Date.now() - 120000 },
      gasohol91: { available: true,  price: 36.70, updatedAt: Date.now() - 120000 },
      gasohol95: { available: true,  price: 39.98, updatedAt: Date.now() - 120000 },
      e20:       { available: true,  price: 33.25, updatedAt: Date.now() - 120000 },
      e85:       { available: false, price: 22.10, updatedAt: Date.now() - 3600000 },
    },
    confidence: 95, reportCount: 78, featured: true,
    createdAt: Date.now(), updatedAt: Date.now() - 120000,
  },
  {
    name: 'Caltex เชียงใหม่ นิมมาน', brand: 'Caltex', province: 'เชียงใหม่',
    address: 'ถ.นิมมานเหมินทร์ เชียงใหม่', lat: 18.7979, lng: 98.9678,
    phone: '053-211111', openHours: '06:00–23:00',
    fuels: {
      diesel:    { available: false, price: 30.10, updatedAt: Date.now() - 7200000 },
      gasohol91: { available: true,  price: 36.95, updatedAt: Date.now() - 1800000 },
      gasohol95: { available: true,  price: 40.30, updatedAt: Date.now() - 1800000 },
      lpg:       { available: true,  updatedAt: Date.now() - 1800000 },
    },
    confidence: 71, reportCount: 15, featured: false,
    createdAt: Date.now(), updatedAt: Date.now() - 1800000,
  },
];
