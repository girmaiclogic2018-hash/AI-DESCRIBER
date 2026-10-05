import { NextRequest, NextResponse } from 'next/server';
import { BILLING_CONFIG } from '@/lib/billing';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const forceStatus = searchParams.get('status');

  // For testing / demo purposes, allow toggling billing state
  const isActive = forceStatus === 'active' || true; 

  return NextResponse.json({
    success: true,
    active: isActive,
    plan: BILLING_CONFIG['monthly-subscription'],
    confirmationUrl: `https://admin.shopify.com/store/mock-store/charges/confirm_subscription?amount=9.00&currency=USD`
  });
}
