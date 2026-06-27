import type { Card } from "../core/types";

export const starterDeck: Card[] = [
  // Tier 1 — greetings & essentials
  { id: "b-hello", thai: "สวัสดี", romanization: "sawatdee", english: "hello", category: "greetings", tier: 1, source: "builtin" },
  { id: "b-thanks", thai: "ขอบคุณ", romanization: "khopkhun", english: "thank you", category: "greetings", tier: 1, source: "builtin" },
  { id: "b-yes", thai: "ใช่", romanization: "chai", english: "yes", category: "essentials", tier: 1, source: "builtin" },
  { id: "b-no", thai: "ไม่", romanization: "mai", english: "no", category: "essentials", tier: 1, source: "builtin" },
  { id: "b-sorry", thai: "ขอโทษ", romanization: "khotot", english: "sorry / excuse me", category: "greetings", tier: 1, source: "builtin" },
  { id: "b-good", thai: "ดี", romanization: "dee", english: "good", category: "essentials", tier: 1, source: "builtin" },
  { id: "b-water", thai: "น้ำ", romanization: "nam", english: "water", category: "food", tier: 1, source: "builtin" },
  { id: "b-rice", thai: "ข้าว", romanization: "khao", english: "rice", category: "food", tier: 1, source: "builtin" },

  // Tier 2 — numbers & more nouns
  { id: "b-one", thai: "หนึ่ง", romanization: "neung", english: "one", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-two", thai: "สอง", romanization: "song", english: "two", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-three", thai: "สาม", romanization: "sam", english: "three", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-four", thai: "สี่", romanization: "see", english: "four", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-five", thai: "ห้า", romanization: "ha", english: "five", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-coffee", thai: "กาแฟ", romanization: "kafae", english: "coffee", category: "food", tier: 2, source: "builtin" },
  { id: "b-egg", thai: "ไข่", romanization: "khai", english: "egg", category: "food", tier: 2, source: "builtin" },
  { id: "b-chicken", thai: "ไก่", romanization: "kai", english: "chicken", category: "food", tier: 2, source: "builtin" },

  // Tier 3 — adjectives, verbs, useful words
  { id: "b-delicious", thai: "อร่อย", romanization: "aroi", english: "delicious", category: "food", tier: 3, source: "builtin" },
  { id: "b-spicy", thai: "เผ็ด", romanization: "phet", english: "spicy", category: "food", tier: 3, source: "builtin" },
  { id: "b-hot", thai: "ร้อน", romanization: "ron", english: "hot", category: "adjectives", tier: 3, source: "builtin" },
  { id: "b-cold", thai: "เย็น", romanization: "yen", english: "cold", category: "adjectives", tier: 3, source: "builtin" },
  { id: "b-go", thai: "ไป", romanization: "pai", english: "to go", category: "verbs", tier: 3, source: "builtin" },
  { id: "b-eat", thai: "กิน", romanization: "kin", english: "to eat", category: "verbs", tier: 3, source: "builtin" },
  { id: "b-want", thai: "อยาก", romanization: "yak", english: "to want", category: "verbs", tier: 3, source: "builtin" },

  // Tier 4 — common phrases / sentences
  { id: "b-howareyou", thai: "สบายดีไหม", romanization: "sabai dee mai", english: "how are you?", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-imfine", thai: "สบายดี", romanization: "sabai dee", english: "I'm fine", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-howmuch", thai: "เท่าไหร่", romanization: "tao rai", english: "how much?", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-checkbill", thai: "เช็คบิล", romanization: "chek bin", english: "check, please", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-dontunderstand", thai: "ไม่เข้าใจ", romanization: "mai khao jai", english: "I don't understand", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-where-toilet", thai: "ห้องน้ำอยู่ไหน", romanization: "hong nam yu nai", english: "where is the toilet?", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-notspicy", thai: "ไม่เผ็ด", romanization: "mai phet", english: "not spicy", category: "phrases", tier: 4, source: "builtin" },
];
