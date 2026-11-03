import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_LISTINGS } from '@/data/listings';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase().trim();

  let items = INITIAL_LISTINGS;
  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category);
  }
  if (q) {
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ listings: items, total: items.length });
}
