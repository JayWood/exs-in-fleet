import { NextRequest, NextResponse } from 'next/server';
import { Router } from '@/lib/esi/Router';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ esiPath: string[] }> }
) {
  try {
    const router = new Router( request );
    const pathParams = await params;
    return router.dispatch( pathParams.esiPath.join('/'), 'GET');
  } catch (error) {
    console.error('ESI API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data from ESI' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ esiPath: string[] }> }
) {
  try {
    const router = new Router( request );
    const pathParams = await params;
    return router.dispatch( pathParams.esiPath.join('/'), 'POST');
  } catch (error) {
    console.error('ESI API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data from ESI' },
      { status: 500 }
    );
  }
}
