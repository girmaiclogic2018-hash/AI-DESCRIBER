import { NextRequest, NextResponse } from 'next/server';
import { handleProductCreateWebhook } from '@/web/api/webhooks-products-create';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mockRes = {
      status: (code: number) => ({
        send: () => {},
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };
    
    // Trigger webhook handler in background or async
    handleProductCreateWebhook({ body }, mockRes as any);

    return NextResponse.json({ success: true, message: "Webhook accepted and queued for background automation." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
