export const AI_PROMPT_GENERAL = `Quyidagi testni JSON formatiga o'tkazing. Faqat questions massivini qaytaring.

FORMAT:
{
  "questions": [
    {
      "questionText": "Savol matni. Formulalar $LaTeX$ da: $x^2 + 5x = 0$",
      "questionImage": null,
      "options": ["A variant", "B variant", "C variant", "D variant"],
      "correctAnswer": 0,
      "explanation": "",
      "analysis": "Bu savolning to'liq tahlili yoki izoh (ixtiyoriy)",
      "youtubeUrl": ""
    }
  ]
}

QOIDALAR:
- correctAnswer: 0=A, 1=B, 2=C, 3=D
- options da 4 ta variant SHART
- Formulalar: $x^2$ (inline), $$\\frac{a}{b}$$ (block)
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- Jadvallar: <table><tr><td>...</td></tr></table>
- analysis: savol bo'yicha AI tahlil matni (ixtiyoriy, bo'sh qoldirsa ham bo'ladi). Ichidagi formulalarni ham $x^2$, $$\\frac{a}{b}$$ kabi LaTeX bilan yozing — oddiy matn emas
- youtubeUrl: savol bo'yicha YouTube link (ixtiyoriy)`;

export const AI_PROMPT_SAT = `Quyidagi SAT Math testini JSON formatiga o'tkazing. Faqat questions massivini qaytaring.

SAT MATH DA 2 XIL SAVOL TURI BOR:

1) MCQ (Multiple Choice) — 4 ta variant, bitta to'g'ri javob:
{
  "questionText": "Savol matni. Formulalar $LaTeX$ da: $x^2 + 5x = 0$",
  "questionImage": null,
  "options": ["A variant", "B variant", "C variant", "D variant"],
  "correctAnswer": 0,
  "explanation": "",
  "analysis": "Bu savolning to'liq tahlili (ixtiyoriy)",
  "youtubeUrl": ""
}

2) SPR (Student-Produced Response) — raqam kiritish, variant yo'q:
{
  "questionText": "Savol matni. Masalan: $2x + 3 = 11$ bo'lsa, x = ?",
  "questionImage": null,
  "options": [],
  "correctAnswer": 400,
  "explanation": "",
  "analysis": "",
  "youtubeUrl": ""
}

QOIDALAR:
- MCQ: correctAnswer 0=A, 1=B, 2=C, 3=D; options da 4 ta variant SHART
- SPR: options: [] (bo'sh massiv)
- SPR correctAnswer = to'g'ri javob × 100 (MUHIM):
    butun son  4    → correctAnswer: 400
    o'nlik    3.5   → correctAnswer: 350
    kasr      1/2   → correctAnswer: 50
    kasr      3/4   → correctAnswer: 75
- SAT da har 22 savoldan taxminan 5-6 tasi SPR bo'ladi
- Formulalar: $x^2$ (inline), $$\\frac{a}{b}$$ (block)
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- analysis: savol bo'yicha AI tahlil matni (ixtiyoriy). Ichidagi formulalarni ham $x^2$, $$\\frac{a}{b}$$ kabi LaTeX bilan yozing — oddiy matn emas
- youtubeUrl: savol bo'yicha YouTube link (ixtiyoriy)`;

export const AI_PROMPT_MILLIY_SERTIFIKAT = `Quyidagi Milliy Sertifikat matematika testini JSON formatiga o'tkazing. Faqat questions massivini qaytaring.

Test 45 ta ko'rinadigan savoldan iborat (questions massivida ham 45 ta element bo'lishi kerak — 55 emas!), va 3 XIL SAVOL TURI BOR:

1) SINGLE (oddiy) — 4 ta variant, bitta to'g'ri javob (odatda 1-32 savollar):
{
  "questionText": "Savol matni. Formulalar $LaTeX$ da: $x^2 + 5x = 0$",
  "questionImage": null,
  "options": ["A variant", "B variant", "C variant", "D variant"],
  "correctAnswer": 0,
  "explanation": ""
}

2) MATCHING (moslashtirish) — bir nechta ketma-ket savol UMUMIY javob bankidan (masalan A-F, 6 ta) tanlaydi (odatda 33-35 savollar):
{
  "questionType": "MATCHING",
  "section": "match-1",
  "questionText": "33. Sharning radiusini toping.",
  "options": ["√2/2", "√3/2", "√3/4", "4√3/9", "1/2", "2/3"],
  "correctAnswer": 2
},
{
  "questionType": "MATCHING",
  "section": "match-1",
  "questionText": "34. Piramida yon yog'iga urilgan nuqtasidan asosigacha eng qisqa masofani toping.",
  "options": ["√2/2", "√3/2", "√3/4", "4√3/9", "1/2", "2/3"],
  "correctAnswer": 4
}
MUHIM: bir guruhdagi barcha MATCHING savollar bir xil "section" qiymatiga va bir xil "options" bankiga ega bo'lishi SHART (ketma-ket joylashtiring). correctAnswer — bu shu bankdagi variant indeksi (0,1,2...), oddiy indeks, ×100 qilinmaydi.

3) TWO_PART (ikki qismli) — bitta savolda ikkita mustaqil raqamli javob (a va b), variant yo'q (odatda 36-45 savollar):
{
  "questionType": "TWO_PART",
  "questionText": "Tenglamani yeching: $x^4-12x^2+16\\\\sqrt{2}x-12=0$\\na) Tenglama nechta turli haqiqiy ildizga ega?\\nb) Tenglamaning turli haqiqiy ildizlari ko'paytmasini toping.",
  "options": [],
  "correctAnswer": 300,
  "correctAnswerB": -1200
}
MUHIM: TWO_PART uchun "correctAnswer" — "a" javobi, "correctAnswerB" — "b" javobi. Ikkalasi ham ×100 qilib kodlanadi (SPR bilan bir xil qoida):
    butun son  3    → 300
    o'nlik    3.5   → 350
    manfiy    -12   → -1200
    kasr      1/2   → 50

UMUMIY QOIDALAR:
- SINGLE: correctAnswer 0=A, 1=B, 2=C, 3=D; options da 4 ta variant SHART
- MATCHING: correctAnswer — oddiy indeks (×100 QILINMAYDI), options 4 tadan ko'p bo'lishi mumkin
- TWO_PART: options: [] (bo'sh massiv), correctAnswer va correctAnswerB — ikkalasi ham ×100 kodlangan
- Formulalar: $x^2$ (inline), $$\\frac{a}{b}$$ (block)
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- TWO_PART savolning "a)" va "b)" qismlarini questionText ichida "\\n" bilan ajratib yozing`;

export function getAiPrompt(testType: string): string {
  if (testType === "SAT") return AI_PROMPT_SAT;
  if (testType === "MILLIY_SERTIFIKAT") return AI_PROMPT_MILLIY_SERTIFIKAT;
  return AI_PROMPT_GENERAL;
}

export const AI_PROMPT_SINGLE_QUESTION = `Quyidagi bitta savolni JSON formatiga o'tkazing. Faqat bitta savol obyektini qaytaring (massiv emas, "questions" kaliti ham kerak emas).

FORMAT:
{
  "questionText": "Savol matni. Formulalar $LaTeX$ da: $x^2 + 5x = 0$",
  "questionImage": null,
  "options": ["A variant", "B variant", "C variant", "D variant"],
  "correctAnswer": 0,
  "explanation": "",
  "analysis": "Bu savolning to'liq tahlili yoki izoh (ixtiyoriy)",
  "youtubeUrl": ""
}

QOIDALAR:
- correctAnswer: 0=A, 1=B, 2=C, 3=D
- options da 4 ta variant SHART
- Formulalar: $x^2$ (inline), $$\\frac{a}{b}$$ (block)
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- Jadvallar: <table><tr><td>...</td></tr></table>
- analysis: savol bo'yicha AI tahlil matni (ixtiyoriy). Ichidagi formulalarni ham LaTeX bilan yozing
- youtubeUrl: savol bo'yicha YouTube link (ixtiyoriy)`;
