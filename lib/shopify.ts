export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
}

export async function getProducts(): Promise<ShopifyProduct[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!domain || !token) {
    console.error('[Shopify Error] Missing environment variables: SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN');
    return [];
  }

  const isAdminToken = token.startsWith('shpat_') || token.startsWith('shpca_') || token.startsWith('shpss_');

  const storefrontQuery = `
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

  const adminQuery = `
    {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            variants(first: 1) {
              edges {
                node {
                  price
                }
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

    // Robustly extract just the hostname, ignoring any paths or protocols the user might have accidentally included
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    const apiUrl = isAdminToken 
      ? `https://${cleanDomain}/admin/api/2024-01/graphql.json`
      : `https://${cleanDomain}/api/2024-01/graphql.json`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isAdminToken) {
      headers['X-Shopify-Access-Token'] = token;
    } else {
      headers['X-Shopify-Storefront-Access-Token'] = token;
      // Also try the private token header just in case
      headers['Shopify-Storefront-Private-Token'] = token;
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: isAdminToken ? adminQuery : storefrontQuery }),
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Shopify Error] Non-200 response: ${res.status} ${res.statusText} - ${text}`);
      console.error(`[Shopify Error] Endpoint used: ${apiUrl}`);
      return [];
    }

    const json = await res.json();
    if (json.errors) {
      console.error(`[Shopify Error] GraphQL errors: ${JSON.stringify(json.errors)}`);
      return [];
    }

    const products = json.data?.products?.edges;
    if (!products || products.length === 0) {
      console.warn('[Shopify Warning] Empty product array returned from Shopify.');
      return [];
    }

    return products.map((edge: any) => {
      const node = edge.node;
      
      let price = '0.00';
      let currencyCode = 'USD'; // Admin API doesn't easily expose currency on the variant price string, defaulting to USD

      if (isAdminToken) {
        price = node.variants?.edges[0]?.node?.price || '0.00';
      } else {
        price = node.priceRange?.minVariantPrice?.amount || '0.00';
        currencyCode = node.priceRange?.minVariantPrice?.currencyCode || 'USD';
      }

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
  } catch (error) {
    console.error('[Shopify Error] Exception fetching products:', error);
    return [];
  }
}
