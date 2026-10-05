export const shopify = {
  session: {
    getOfflineId: (shop) => `offline_${shop}`,
  },
  config: {
    sessionStorage: {
      loadSession: async (id) => ({ id, shop: 'example.myshopify.com', accessToken: 'mock_token' }),
    },
  },
  clients: {
    Graphql: class {
      constructor({ session }) {
        this.session = session;
      }
      async request(query, variables) {
        return { data: { productUpdate: { product: { id: 'gid://shopify/Product/123' } }, node: { status: 'ACTIVE' } } };
      }
    }
  },
  utils: {
    sanitizeShop: (shop) => shop || 'store.myshopify.com',
  }
};
