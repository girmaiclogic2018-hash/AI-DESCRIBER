import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { bankName, accountHolder, accountNumber, routingNumber, country } = await req.json();

    if (!bankName || !accountNumber || !routingNumber) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required bank connection details." 
      }, { status: 400 });
    }

    // Simulate secure bank account verification via Plaid / Stripe Payouts API
    const maskedAccount = `****${accountNumber.slice(-4)}`;
    
    return NextResponse.json({
      success: true,
      message: "Bank account successfully connected and verified for payouts.",
      bankDetails: {
        bankName,
        accountHolder: accountHolder || 'Merchant Owner',
        maskedAccount,
        country: country || 'United States',
        status: 'Active & Verified',
        payoutSchedule: 'Instant (1-2 business days for standard ACH)',
        connectedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Bank connection failed' }, { status: 500 });
  }
}
