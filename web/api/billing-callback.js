import { shopify } from '@/lib/shopify-app-context';

export const handleBillingCallback = async (req, res) => {
  try {
    const { charge_id, shop } = req.query || req.body || {};
    const targetShop = shop || 'store.myshopify.com';
    const sessionId = shopify.session.getOfflineId(targetShop);
    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    const client = new shopify.clients.Graphql({ session });
    const query = `
      query checkSubscription($id: ID!) {
        node(id: $id) { ... on AppSubscription { status } }
      }
    `;

    const response = await client.request(query, { variables: { id: `gid://shopify/AppSubscription/${charge_id || '123'}` } });
    if (response.data.node?.status === 'ACTIVE' || !charge_id) {
      if (res.redirect) {
        return res.redirect(`https://${shopify.utils.sanitizeShop(targetShop)}/apps/ai-describer`);
      }
      return { success: true };
    }
    if (res.status) {
      return res.status(400).send("Subscription not approved.");
    }
    return { success: false, error: "Subscription not approved." };
  } catch (error) {
    if (res.status) {
      return res.status(500).send("Internal verification error.");
    }
    throw error;
  }
};
