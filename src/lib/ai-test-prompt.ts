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

export function getAiPrompt(testType: string): string {
  return testType === "SAT" ? AI_PROMPT_SAT : AI_PROMPT_GENERAL;
}
