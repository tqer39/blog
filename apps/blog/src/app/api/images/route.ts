import { NextResponse, type NextRequest } from 'next/server';
import { getImages, uploadImage } from '@/lib/api/server';
import { withAuthSimple, withCsrfAuthSimple } from '@/lib/api/with-auth';

export const GET = withAuthSimple(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const perPage = searchParams.get('perPage');

    const result = await getImages({
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const formData = await request.formData();
    const result = await uploadImage(formData);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
