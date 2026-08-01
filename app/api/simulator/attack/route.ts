import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    const proxyUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    // Forward to the real Express proxy so WebSocket broadcasts, audit logs, and threat feed all fire
    const proxyResponse = await fetch(`${proxyUrl}/simulator/attack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });

    if (!proxyResponse.ok) {
      throw new Error(`Proxy error: ${proxyResponse.status}`);
    }

    const data = await proxyResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Simulator API] Error forwarding to proxy:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to reach proxy server. Is it running on port 4000?' }, { status: 500 });
  }
}

