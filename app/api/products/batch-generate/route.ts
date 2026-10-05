import { NextRequest, NextResponse } from 'next/server';
import { generateProductDescription } from '@/lib/openai-helper';
import { shopify } from '@/lib/shopify-app-context';

export async function POST(req: NextRequest) {
  try {
    const { products, shop } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: 'No products provided for batch processing.' }, { status: 400 });
    }

    const sessionId = shopify.session.getOfflineId(shop || 'store.myshopify.com');
    const session = await shopify.config.sessionStorage.loadSession(sessionId);
    const client = session ? new shopify.clients.Graphql({ session }) : null;

    const results = [];

    for (const item of products) {
      const { id, title, vendor, tags } = item;
      try {
        const generatedHtml = await generateProductDescription(title, vendor || '', tags || '');
        
        // Mutate back to Shopify catalog via GraphQL Admin API
        if (client) {
          const query = `
            mutation productUpdate($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id }
                userErrors { field message }
              }
            }
          `;
          await client.request(query, {
            variables: {
              input: { id: id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`, bodyHtml: generatedHtml }
            }
          });
        }

        results.push({
          id,
          title,
          success: true,
          description: generatedHtml,
          updatedAt: new Date().toISOString()
        });
      } catch (err: any) {
        results.push({
          id,
          title,
          success: false,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: results.filter(r => r.success).length,
      totalRequested: products.length,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Batch update failed' }, { status: 500 });
  }
}
