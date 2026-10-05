import { shopify } from '@/lib/shopify-app-context';
import { generateProductDescription } from '@/lib/openai-helper';

export const handleProductCreateWebhook = async (req, res) => {
  if (res && res.status) {
    res.status(200).send(); // Promptly notify Shopify server of event delivery
  }

  try {
    const { shop, body } = req.body || {};
    const product = typeof body === 'string' ? JSON.parse(body) : body;

    if (!product || (product.body_html && product.body_html.trim() !== "")) return;

    const generatedHtml = await generateProductDescription(product.title, product.vendor || '', product.tags || '');
    const sessionId = shopify.session.getOfflineId(shop || 'example.myshopify.com');
    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) return;

    const client = new shopify.clients.Graphql({ session });
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
        input: { id: `gid://shopify/Product/${product.id}`, bodyHtml: generatedHtml }
      }
    });
    console.log(`Autonomous execution completed for Product ID: ${product.id}`);
  } catch (error) {
    console.error("Background automation system error:", error.message);
  }
};
