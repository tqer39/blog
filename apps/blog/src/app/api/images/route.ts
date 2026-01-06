import { type NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/api/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadImage(formData);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
