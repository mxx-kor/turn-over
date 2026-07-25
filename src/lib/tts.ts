// Guess a BCP-47 language tag from the text's script so speechSynthesis
// picks a sensible voice. Falls back to English for Latin-script text.
function guessLang(text: string): string {
  if (/[가-힣]/.test(text)) return 'ko-KR'; // Hangul
  if (/[ぁ-ヿ]/.test(text)) return 'ja-JP'; // Hiragana/Katakana
  if (/[一-鿿]/.test(text)) return 'zh-CN'; // CJK ideographs
  if (/[Ѐ-ӿ]/.test(text)) return 'ru-RU'; // Cyrillic
  return 'en-US';
}

export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Stop anything currently playing so rapid clicks don't queue up.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = guessLang(text);
  window.speechSynthesis.speak(utterance);
}
