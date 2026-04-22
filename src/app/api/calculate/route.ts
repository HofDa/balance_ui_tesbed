import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Hier Deine Logik: CO2 pro kWh, Wasserverbrauch-Faktor etc.
  const score = calculateImpact(body);

  return NextResponse.json({ 
    co2Total: score, 
    status: "success",
    timestamp: new Date().toISOString()
  });
}

function calculateImpact(data: { roof: { hasSolar: boolean } }) {
  let co2 = 500; // Basiswert
  if (data.roof.hasSolar) co2 -= 150;
  return co2;
}