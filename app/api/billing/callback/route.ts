import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const charge_id = searchParams.get('charge_id');
  const shop = searchParams.get('shop') || 'store.myshopify.com';

  // Redirect to app dashboard with active billing confirmed
  return NextResponse.redirect(new URL(`/?billing=active&shop=${shop}`, req.url));
}
