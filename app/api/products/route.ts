import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const debugInfo = await getProducts();
    return NextResponse.json(debugInfo);
  } catch (error: any) {
    console.error('[Shopify API Route Error] Failed to fetch products:', error);
    return NextResponse.json({ 
      normalizedDomain: 'unknown',
      endpoint: 'unknown',
      productCount: 0,
      products: [],
      shopifyError: error.message || String(error)
    }, { status: 500 });
  }
}
