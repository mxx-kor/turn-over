import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_DOWNLOAD_URL =
  'https://github.com/mxx-kor/turn-over/releases/download/v0.1.1/Turn-Over-0.1.1-arm64.dmg';

function getDownloadUrl() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return (
      process.env.DESKTOP_DOWNLOAD_URL_PROD ??
      process.env.DESKTOP_DOWNLOAD_URL ??
      DEFAULT_DOWNLOAD_URL
    );
  }

  return (
    process.env.DESKTOP_DOWNLOAD_URL_DEV ??
    process.env.DESKTOP_DOWNLOAD_URL ??
    process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL ??
    DEFAULT_DOWNLOAD_URL
  );
}

export function GET() {
  const downloadUrl = getDownloadUrl();

  try {
    return NextResponse.redirect(new URL(downloadUrl));
  } catch {
    return NextResponse.json(
      { error: 'Invalid desktop download URL' },
      { status: 500 },
    );
  }
}
