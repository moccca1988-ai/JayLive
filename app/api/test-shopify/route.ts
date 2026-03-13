import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  const query = `{ shop { name } }`;
  const apiUrl = `https://${domain}/api/2024-01/graphql.json`;
  
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Shopify-Storefront-Private-Token': token || '',
      },
      body: JSON.stringify({ query })
    });
    
    const text = await res.text();
    return NextResponse.json({ status: res.status, body: text, apiUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
