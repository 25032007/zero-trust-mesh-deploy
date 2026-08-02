import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const proxyUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${proxyUrl}/audit/compliance`);
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch compliance report from proxy server.' },
      { status: 500 }
    );
  }
}
