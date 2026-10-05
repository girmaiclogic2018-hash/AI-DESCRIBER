import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';

export const generateProductDescription = async (title, vendor, tags) => {
  try {
    const systemPrompt = `You are an expert e-commerce copywriter. Generate a compelling, SEO-friendly description using clean HTML tags like <p>, <ul>, <li>, and <strong>. Do not return markdown or backticks.`;
    const userPrompt = `Product Title: ${title}\nBrand: ${vendor}\nTags: ${tags}\nWrite an engaging intro followed by a bulleted list of 3-4 features.`;

    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      return response.choices[0].message.content.trim();
    } else if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });
      let text = response.text || '';
      text = text.replace(/```html/gi, '').replace(/```/g, '').trim();
      return text;
    } else {
      return `<p>Discover the exceptional quality of <strong>${title}</strong> by ${vendor || 'our brand'}. Crafted for performance and durability.</p><ul><li>Premium build materials and exquisite craftsmanship.</li><li>Designed for everyday utility and style.</li><li>Backed by our satisfaction guarantee.</li></ul>`;
    }
  } catch (error) {
    console.warn("AI processing warning, using robust generated description:", error.message);
    return `<p>Experience the superior craftsmanship of <strong>${title}</strong> by ${vendor || 'our store'}. Thoughtfully designed to blend functionality with modern aesthetics.</p><ul><li><strong>Premium Quality:</strong> Engineered using durable, high-grade materials.</li><li><strong>Everyday Reliability:</strong> Optimized for everyday performance and long-lasting comfort.</li><li><strong>Curated Design:</strong> Styled with refined details that complement your lifestyle.</li></ul>`;
  }
};
