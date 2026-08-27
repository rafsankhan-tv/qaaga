import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { basePrice, isUrgent } = body || {};
    const price = Number(basePrice) || 0;

    // Default 20% advance booking deposit
    const advanceRate = 0.2;
    const urgentSurcharge = isUrgent ? Math.round(price * 0.15) : 0;
    const totalPrice = price + urgentSurcharge;
    const advanceAmount = Math.round(totalPrice * advanceRate);
    const remainingAmount = totalPrice - advanceAmount;

    // Platform commission breakdown (e.g., 10% platform share)
    const platformCommission = Math.round(totalPrice * 0.1);

    return NextResponse.json({
      totalPrice,
      advanceAmount,
      remainingAmount,
      urgentSurcharge,
      platformCommission,
      currency: "BDT",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to calculate service fee" },
      { status: 500 }
    );
  }
}
