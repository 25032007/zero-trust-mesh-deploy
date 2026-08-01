import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const proxyUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${proxyUrl}/../health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: 'Failed to connect to proxy server',
      },
      { status: 500 }
    );
  }
}
