export function isThaiVoiceAvailable(): boolean {
  if (typeof speechSynthesis === "undefined") return false;
  return speechSynthesis.getVoices().some((v) => v.lang?.toLowerCase().startsWith("th"));
}

export function speakThai(text: string): void {
  if (typeof speechSynthesis === "undefined") return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  const thaiVoice = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("th"));
  if (thaiVoice) utterance.voice = thaiVoice;
  speechSynthesis.speak(utterance);
}
