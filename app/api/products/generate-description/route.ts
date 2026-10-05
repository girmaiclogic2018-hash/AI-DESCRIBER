import { NextRequest, NextResponse } from 'next/server';
import { generateProductDescription } from '@/lib/openai-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, vendor, tags } = body;
    
    if (!title) {
      return NextResponse.json({ success: false, error: "Missing product title." }, { status: 400 });
    }

    const aiDescription = await generateProductDescription(title, vendor || '', tags || '');
    return NextResponse.json({ success: true, data: aiDescription });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Generation failed' }, { status: 500 });
  }
}
