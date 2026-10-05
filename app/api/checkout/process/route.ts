import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { productId, productName, amount, customerEmail, paymentMethod, bankInfo } = await req.json();

    if (!productName || !amount || !customerEmail) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing checkout parameters (product, amount, customer email)." 
      }, { status: 400 });
    }

    const transactionId = `txn_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}` ;

    // Simulate payment processing, platform fee deduction, and immediate transfer to merchant's connected bank
    const platformFee = Number((amount * 0.029).toFixed(2)); // 2.9% processor fee
    const merchantPayout = Number((amount - platformFee).toFixed(2));

    return NextResponse.json({
      success: true,
      transaction: {
        transactionId,
        orderId,
        productName,
        amount: Number(amount),
        currency: 'USD',
        customerEmail,
        paymentMethod: paymentMethod || 'Credit Card / Apple Pay',
        status: 'Completed',
        timestamp: new Date().toISOString(),
        payoutDetails: {
          destinationBank: bankInfo?.bankName ? `${bankInfo.bankName} (${bankInfo.maskedAccount})` : 'Connected Merchant Bank Account',
          merchantNetDeposit: merchantPayout,
          platformFee,
          transferStatus: 'Deposited to Merchant Bank'
        },
        fulfillment: {
          status: 'Delivered Instantly',
          downloadUrl: `#download-${orderId}`,
          accessCode: `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          instructions: 'Your purchased product and AI enrichment credits have been added to your account instantly.'
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Payment processing failed' }, { status: 500 });
  }
}
