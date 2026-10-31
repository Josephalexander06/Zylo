import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status: number = 200, message?: string) {
  return NextResponse.json(
    {
      data,
      ...(message ? { message } : {}),
    },
    { status }
  );
}

export function errorResponse(error: string, code: string = 'BAD_REQUEST', status: number = 400) {
  return NextResponse.json(
    {
      error,
      code,
    },
    { status }
  );
}

