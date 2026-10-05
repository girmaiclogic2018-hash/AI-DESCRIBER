import { generateProductDescription } from '@/lib/openai-helper';

export const handleGenerateDescriptionRoute = async (req, res) => {
  try {
    const session = res.locals?.shopify?.session || { shop: 'example.myshopify.com' };
    if (!session) return res.status(401).json({ success: false, error: "Unauthorized." });

    const { title, vendor, tags } = req.body || {};
    if (!title) return res.status(400).json({ success: false, error: "Missing title." });

    const aiDescription = await generateProductDescription(title, vendor, tags);
    return res.status(200).json({ success: true, data: aiDescription });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
