import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[Shopify API Route Error] Failed to fetch products:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
