export async function translateText(
  text: string,
  targetLang: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(
    `https://lingva.ml/api/v1/auto/${targetLang}/${encodeURIComponent(text)}`,
    { signal },
  );
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  return data.translation as string;
}

export function getTargetLang(): string {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en';
  return locale.split('-')[0];
}
