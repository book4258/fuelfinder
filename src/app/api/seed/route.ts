/**
 * app/api/seed/route.ts
 * DEV ONLY — seeds demo stations into Firestore.
 * Call once: GET http://localhost:3000/api/seed
 * Delete or add auth guard before going to production.
 */

import { NextResponse }                            from 'next/server';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db }                                      from '@/lib/firebase';
import { DEMO_STATIONS }                           from '@/lib/firestore';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const col      = collection(db, 'stations');
    const existing = await getDocs(query(col, limit(1)));

    if (!existing.empty) {
      return NextResponse.json({ message: 'Already seeded' });
    }

    const ids: string[] = [];
    for (const station of DEMO_STATIONS) {
      const ref = await addDoc(col, {
        ...station,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      ids.push(ref.id);
    }

    return NextResponse.json({ message: `Seeded ${ids.length} stations`, ids });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json(
      { error: 'Seed failed — check Firebase credentials in .env.local', detail: String(err) },
      { status: 500 },
    );
  }
}
