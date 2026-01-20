import { NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/api/server';
import { withAuthSimple, withCsrfAuthSimple } from '@/lib/api/with-auth';

export const GET = withAuthSimple(async () => {
  try {
    const result = await getSiteSettings();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await updateSiteSettings(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
