export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
}

export interface ShopifyDebugResponse {
  normalizedDomain: string;
  endpoint: string;
  productCount: number;
  products: ShopifyProduct[];
  shopifyStatus?: number;
  shopifyError?: any;
}

export async function getProducts(): Promise<ShopifyDebugResponse> {
  let rawDomain = process.env.SHOPIFY_STORE_DOMAIN || 'jayjaymustafashopping.myshopify.com';
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  // Normalize SHOPIFY_STORE_DOMAIN: remove https:// if present, remove trailing slash
  let normalizedDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Important likely domain issue: Use the Shopify internal myshopify domain
  if (normalizedDomain === 'jayjaym.com' || normalizedDomain === 'www.jayjaym.com' || normalizedDomain === 'jayjaym.myshopify.com') {
    normalizedDomain = 'jayjaymustafashopping.myshopify.com';
  }

  const endpoint = `https://${normalizedDomain}/api/2026-01/graphql.json`;

  const debugResponse: ShopifyDebugResponse = {
    normalizedDomain,
    endpoint,
    productCount: 0,
    products: [],
  };

  if (!token) {
    debugResponse.shopifyError = 'Missing SHOPIFY_ACCESS_TOKEN environment variable';
    return debugResponse;
  }

  const query = `
    {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    // Bypass certificate expiration issues in this environment
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Shopify-Storefront-Private-Token': token,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store', // Ensure fresh fetch for debugging
    });

    debugResponse.shopifyStatus = res.status;

    if (!res.ok) {
      const text = await res.text();
      debugResponse.shopifyError = `Non-200 response: ${res.statusText} - ${text}`;
      return debugResponse;
    }

    const json = await res.json();
    if (json.errors) {
      debugResponse.shopifyError = json.errors;
      return debugResponse;
    }

    const productsEdges = json.data?.products?.edges;
    if (!productsEdges || productsEdges.length === 0) {
      debugResponse.shopifyError = 'Empty product array returned from Shopify.';
      return debugResponse;
    }

    debugResponse.products = productsEdges.map((edge: any) => {
      const node = edge.node;
      const price = node.priceRange?.minVariantPrice?.amount || '0.00';
      const currencyCode = node.priceRange?.minVariantPrice?.currencyCode || 'USD';
      const imageUrl = node.images?.edges[0]?.node?.url || '';

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        price,
        currencyCode,
        imageUrl,
      };
    });

    debugResponse.productCount = debugResponse.products.length;
    return debugResponse;

  } catch (error: any) {
    debugResponse.shopifyError = error.message || String(error);
    return debugResponse;
  }
}
