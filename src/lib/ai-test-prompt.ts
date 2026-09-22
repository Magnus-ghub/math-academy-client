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
- Formulalar: $x^2$ (inline). Kasrlar uchun \\frac EMAS, HAR DOIM \\dfrac ishlating (dfrac kasrni kattaroq va aniqroq ko'rsatadi, hatto matn ichida — inline holatda — bo'lsa ham): $\\dfrac{a}{b}$ (matn ichida ham), yoki $$\\dfrac{a}{b}$$ (block)
- Pul miqdori yozsangiz "$" belgisini backslash bilan qoching: \\$9, \\$6 — aks holda LaTeX formula chegarasi deb noto'g'ri o'qiladi
- Foiz belgisi yozsangiz (masalan "25%") "%" ni HAR DOIM backslash bilan qoching: "25\\%" — aks holda LaTeX buni izoh (comment) belgisi deb hisoblaydi va undan keyingi BUTUN matnni jimgina o'chirib tashlaydi (bu qoida "correctAnswerText"/"correctAnswerBText" ichida ham, $ ... $ formula ichida ham amal qiladi)
- Takrorlanuvchi raqamlar/naqsh (masalan "2222...2, 50 ta raqam"): \\underbrace{...}_{\\text{...}} bilan yozing, MASALAN: $\\underbrace{2222\\ldots2}_{50\\ \\text{ta raqam}}$ — natijada raqamlar ostida figurali qavs va izoh chiqadi. MUHIM: bu \\underbrace{}_{}  (pastki belgili) shakl, \\dfrac{}{} kabi ikkita ketma-ket qavs EMAS, shuning uchun avtomatik $ bilan o'ralmaydi — butun ifodani (pastki izohi bilan birga) qo'lda $ ... $ ichiga oling
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- Jadvallar: qator-qator "ustun1 | ustun2\\nqiymat1 | qiymat2" formatida yozing (yoki <table> HTML) — MUHIM: agar javob varianti (options ichidagi bitta element)ning o'zi jadval bo'lsa (masalan x/y qiymatlar jadvali), o'sha variant matnini ham vergul bilan ajratilgan ro'yxat emas, aynan shu qator-qator formatda yozing: "x | y\\n-5 | 6\\n-6 | 9\\n-8 | -4"
- analysis: savolning TO'LIQ yechim tahlili (ixtiyoriy, bo'sh qoldirsa ham bo'ladi, lekin to'ldirilsa quyidagicha tuzilishda yozing): yechimni aniq qadamlarga bo'ling, har birini "1-qadam:", "2-qadam:" kabi belgilab boshlang; har bir qadamdan keyin bo'sh qator qoldiring (qadamlar orasida "\\n\\n" bo'lsin) — matn bir qatorga tiqilib qolmasin, o'qish oson bo'lsin; oxirida yakuniy javobni alohida qatorda "Javob: ..." deb ko'rsating. Formulalarni ham $x^2$, $\\dfrac{a}{b}$ kabi LaTeX bilan yozing — oddiy matn emas
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
- Formulalar: $x^2$ (inline). Kasrlar uchun \\frac EMAS, HAR DOIM \\dfrac ishlating (dfrac kasrni kattaroq va aniqroq ko'rsatadi, hatto matn ichida — inline holatda — bo'lsa ham): $\\dfrac{a}{b}$ (matn ichida ham), yoki $$\\dfrac{a}{b}$$ (block)
- Pul miqdori yozsangiz "$" belgisini backslash bilan qoching: \\$9, \\$6 — aks holda LaTeX formula chegarasi deb noto'g'ri o'qiladi
- Foiz belgisi yozsangiz (masalan "25%") "%" ni HAR DOIM backslash bilan qoching: "25\\%" — aks holda LaTeX buni izoh (comment) belgisi deb hisoblaydi va undan keyingi BUTUN matnni jimgina o'chirib tashlaydi (bu qoida "correctAnswerText"/"correctAnswerBText" ichida ham, $ ... $ formula ichida ham amal qiladi)
- Jadvallar: qator-qator "ustun1 | ustun2\\nqiymat1 | qiymat2" formatida yozing (yoki <table> HTML) — MUHIM: agar javob varianti (options ichidagi bitta element)ning o'zi jadval bo'lsa (masalan x/y qiymatlar jadvali), o'sha variant matnini ham vergul bilan ajratilgan ro'yxat emas, aynan shu qator-qator formatda yozing: "x | y\\n-5 | 6\\n-6 | 9\\n-8 | -4"
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- analysis: savolning TO'LIQ yechim tahlili (ixtiyoriy, lekin to'ldirilsa quyidagicha tuzilishda yozing): yechimni aniq qadamlarga bo'ling, har birini "1-qadam:", "2-qadam:" kabi belgilab boshlang; har bir qadamdan keyin bo'sh qator qoldiring (qadamlar orasida "\\n\\n" bo'lsin) — matn bir qatorga tiqilib qolmasin, o'qish oson bo'lsin; oxirida yakuniy javobni alohida qatorda "Javob: ..." deb ko'rsating. Formulalarni ham $x^2$, $\\dfrac{a}{b}$ kabi LaTeX bilan yozing — oddiy matn emas
- youtubeUrl: savol bo'yicha YouTube link (ixtiyoriy)`;

export const AI_PROMPT_MILLIY_SERTIFIKAT = `Quyidagi Milliy Sertifikat matematika testini JSON formatiga o'tkazing. Faqat questions massivini qaytaring.

Test 45 ta ko'rinadigan savoldan iborat (questions massivida ham 45 ta element bo'lishi kerak — 55 emas!), va 3 XIL SAVOL TURI BOR:

1) SINGLE (oddiy) — 4 ta variant, bitta to'g'ri javob (odatda 1-32 savollar):
{
  "questionText": "Savol matni. Formulalar $LaTeX$ da: $x^2 + 5x = 0$",
  "questionImage": null,
  "options": ["A variant", "B variant", "C variant", "D variant"],
  "correctAnswer": 0,
  "explanation": "",
  "analysis": "Bu savolning to'liq, qadam-baqadam yechim tahlili (ixtiyoriy)",
  "youtubeUrl": ""
}

2) MATCHING (moslashtirish) — bir nechta ketma-ket savol UMUMIY javob bankidan (masalan A-F, 6 ta) tanlaydi (odatda 33-35 savollar). Bu savollar odatda bitta UMUMIY SHART (masalan piramida/shar haqida chizma va matn) ostida keladi — bu shart alohida savol emas, "groupPrompt" maydonida beriladi, "questionText" esa har bir savolning O'ZIGA XOS QISQA topshirig'i (raqamsiz, umumiy shartsiz):
{
  "questionType": "MATCHING",
  "section": "match-1",
  "groupPrompt": "SABCD to'rtburchakli muntazam piramidaning yon yoqlari asos tekisligi bilan 30° burchak tashkil qiladi. Bu piramidaga yarim shar ichki shunday chizilganki, uning tekis yoqi piramidaning asosida yotadi, shar sirti esa piramidaning yon yoqlariga urinadi. Piramidaning asosinning tomonidan shar diametrining ayirmasi 1 ga teng. Masalalarni yechishda π ≈ 3 deb oling.",
  "questionText": "Sharning radiusini toping.",
  "questionImage": null,
  "options": ["√2/2", "√3/2", "√3/4", "4√3/9", "1/2", "2/3"],
  "correctAnswer": 2,
  "analysis": "Bu savolning to'liq, qadam-baqadam yechim tahlili (ixtiyoriy)",
  "youtubeUrl": ""
},
{
  "questionType": "MATCHING",
  "section": "match-1",
  "groupPrompt": "SABCD to'rtburchakli muntazam piramidaning yon yoqlari asos tekisligi bilan 30° burchak tashkil qiladi. Bu piramidaga yarim shar ichki shunday chizilganki, uning tekis yoqi piramidaning asosida yotadi, shar sirti esa piramidaning yon yoqlariga urinadi. Piramidaning asosinning tomonidan shar diametrining ayirmasi 1 ga teng. Masalalarni yechishda π ≈ 3 deb oling.",
  "questionText": "Sharning piramida yon yoqiga urilgan nuqtasidan piramidaning asosigacha bo'lgan eng qisqa masofani toping.",
  "questionImage": null,
  "options": ["√2/2", "√3/2", "√3/4", "4√3/9", "1/2", "2/3"],
  "correctAnswer": 4,
  "analysis": "Bu savolning to'liq, qadam-baqadam yechim tahlili (ixtiyoriy)",
  "youtubeUrl": ""
}
MUHIM: bir guruhdagi barcha MATCHING savollar bir xil "section" qiymatiga, bir xil "options" bankiga VA bir xil "groupPrompt" matniga ega bo'lishi SHART (ketma-ket joylashtiring). correctAnswer — bu shu bankdagi variant indeksi (0,1,2...), oddiy indeks, ×100 qilinmaydi.
MUHIM (umumiy shart/groupPrompt): "questionText" ga faqat o'sha savolga xos qisqa topshiriqni yozing (raqamlashsiz — "33." kabi prefiks yozmang, buni interfeys o'zi qo'shadi), umumiy shart matnini "questionText" ichiga QO'SHMANG — u faqat "groupPrompt" da, guruhdagi HAR BIR savolda AYNAN BIR XIL holda takrorlanadi. Agar guruhda umumiy shart/matn bo'lmasa (kamdan-kam), "groupPrompt": null qoldiring.
MUHIM (chizma/rasm): chizma/rasm matn orqali berilmaydi — "questionImage" har doim null qoldiriladi, admin uni keyinroq savolni tahrirlash sahifasida qo'lda (guruhdagi istalgan bitta savolga) yuklaydi.

3) TWO_PART (ikki qismli) — bitta savolda ikkita mustaqil raqamli javob (a va b), variant yo'q (odatda 36-45 savollar):
{
  "questionType": "TWO_PART",
  "questionText": "Tenglamani yeching: $x^4-12x^2+16\\\\sqrt{2}x-12=0$\\na) Tenglama nechta turli haqiqiy ildizga ega?\\nb) Tenglamaning turli haqiqiy ildizlari ko'paytmasini toping.",
  "options": [],
  "correctAnswer": 300,
  "correctAnswerB": -1200,
  "analysis": "Bu savolning to'liq, qadam-baqadam yechim tahlili (ixtiyoriy)",
  "youtubeUrl": ""
}
MUHIM: TWO_PART uchun "correctAnswer" — "a" javobi, "correctAnswerB" — "b" javobi. Ikkalasi ham ×100 qilib kodlanadi (SPR bilan bir xil qoida):
    butun son  3    → 300
    o'nlik    3.5   → 350
    manfiy    -12   → -1200
    kasr      1/2   → 50

MUHIM (ildizli/irratsional javoblar — "correctAnswerText"): agar javob $\\sqrt{}$, $\\pi$ kabi irratsional ifoda bo'lsa, uni QO'LDA o'nlik songa hisoblab ×100 qilish O'RNIGA (bu xatoga juda moyil), "correctAnswer"/"correctAnswerB" o'rniga (yoki ular bilan birga) "correctAnswerText"/"correctAnswerBText" maydoniga XOM LaTeX formulani yozing — tizim buni o'zi aniq hisoblab ×100 songa aylantiradi:
{
  "questionType": "TWO_PART",
  "questionText": "...\\na) ...\\nb) Funksiyaning eng katta qiymatini toping.",
  "options": [],
  "correctAnswer": 300,
  "correctAnswerBText": "8\\\\sqrt{5}/5",
  "analysis": "",
  "youtubeUrl": ""
}
- "correctAnswerText"/"correctAnswerBText" — oddiy LaTeX matn (masalan "8\\\\sqrt{5}/5", "\\\\dfrac{9-3\\\\sqrt{5}}{2}", "18\\\\pi") — hech qanday qo'shimcha $ belgisi kerak emas
- Ratsional (butun/o'nlik/oddiy kasr) javoblar uchun eski "correctAnswer"/"correctAnswerB" (×100 son) usuli ham to'liq ishlaydi — faqat ILDIZLI/IRRATSIONAL javoblarda "...Text" maydonini ishlating
- Har bir qism (a va b) mustaqil — biri oddiy son ("correctAnswer"), ikkinchisi formula ("correctAnswerBText") bo'lishi ham mumkin (yuqoridagi misoldagidek)

UMUMIY QOIDALAR:
- SINGLE: correctAnswer 0=A, 1=B, 2=C, 3=D; options da 4 ta variant SHART
- MATCHING: correctAnswer — oddiy indeks (×100 QILINMAYDI), options 4 tadan ko'p bo'lishi mumkin; umumiy shart "groupPrompt" da (barcha guruh a'zolarida bir xil), "questionText" faqat qisqa topshiriq (raqamsiz)
- TWO_PART: options: [] (bo'sh massiv), correctAnswer va correctAnswerB — ikkalasi ham ×100 kodlangan (ildizli/irratsional javoblarda buning o'rniga correctAnswerText/correctAnswerBText'ga xom LaTeX formula yozing — yuqoridagi misolga qarang)
- Formulalar: $x^2$ (inline). Kasrlar uchun \\frac EMAS, HAR DOIM \\dfrac ishlating (dfrac kasrni kattaroq va aniqroq ko'rsatadi, hatto matn ichida — inline holatda — bo'lsa ham): $\\dfrac{a}{b}$ (matn ichida ham), yoki $$\\dfrac{a}{b}$$ (block)
- Pul miqdori yozsangiz "$" belgisini backslash bilan qoching: \\$9, \\$6 — aks holda LaTeX formula chegarasi deb noto'g'ri o'qiladi
- Foiz belgisi yozsangiz (masalan "25%") "%" ni HAR DOIM backslash bilan qoching: "25\\%" — aks holda LaTeX buni izoh (comment) belgisi deb hisoblaydi va undan keyingi BUTUN matnni jimgina o'chirib tashlaydi (bu qoida "correctAnswerText"/"correctAnswerBText" ichida ham, $ ... $ formula ichida ham amal qiladi)
- Takrorlanuvchi raqamlar/naqsh (masalan "2222...2, 50 ta raqam"): \\underbrace{...}_{\\text{...}} bilan yozing, MASALAN: $\\underbrace{2222\\ldots2}_{50\\ \\text{ta raqam}}$ — bu \\underbrace{}_{} (pastki belgili) shakl, avtomatik $ bilan o'ralmaydi, butun ifodani qo'lda $ ... $ ichiga oling
- Jadvallar: qator-qator "ustun1 | ustun2\\nqiymat1 | qiymat2" formatida yozing (yoki <table> HTML) — agar javob varianti (options ichidagi bitta element)ning o'zi jadval bo'lsa, o'sha variant matnini ham shu qator-qator formatda yozing
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- TWO_PART savolning "a)" va "b)" qismlarini questionText ichida "\\n" bilan ajratib yozing
- analysis: savolning TO'LIQ yechim tahlili (ixtiyoriy, HAR UCH turda — SINGLE, MATCHING, TWO_PART — ham qo'shishingiz mumkin, lekin to'ldirilsa quyidagicha tuzilishda yozing): yechimni aniq qadamlarga bo'ling, har birini "1-qadam:", "2-qadam:" kabi belgilab boshlang; har bir qadamdan keyin bo'sh qator qoldiring (qadamlar orasida "\\n\\n" bo'lsin) — matn bir qatorga tiqilib qolmasin, o'qish oson bo'lsin; oxirida yakuniy javobni alohida qatorda "Javob: ..." deb ko'rsating. Formulalarni ham $x^2$, $\\dfrac{a}{b}$ kabi LaTeX bilan yozing — oddiy matn emas. MATCHING'da analysis har bir sub-savolga alohida yoziladi (groupPrompt kabi umumiy emas)
- youtubeUrl: savol bo'yicha YouTube link (ixtiyoriy), HAR UCH turda ham qo'shsa bo'ladi`;

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
- Formulalar: $x^2$ (inline). Kasrlar uchun \\frac EMAS, HAR DOIM \\dfrac ishlating (dfrac kasrni kattaroq va aniqroq ko'rsatadi, hatto matn ichida — inline holatda — bo'lsa ham): $\\dfrac{a}{b}$ (matn ichida ham), yoki $$\\dfrac{a}{b}$$ (block)
- Pul miqdori yozsangiz "$" belgisini backslash bilan qoching: \\$9, \\$6 — aks holda LaTeX formula chegarasi deb noto'g'ri o'qiladi
- Foiz belgisi yozsangiz (masalan "25%") "%" ni HAR DOIM backslash bilan qoching: "25\\%" — aks holda LaTeX buni izoh (comment) belgisi deb hisoblaydi va undan keyingi BUTUN matnni jimgina o'chirib tashlaydi (bu qoida "correctAnswerText"/"correctAnswerBText" ichida ham, $ ... $ formula ichida ham amal qiladi)
- Takrorlanuvchi raqamlar/naqsh (masalan "2222...2, 50 ta raqam"): \\underbrace{...}_{\\text{...}} bilan yozing, MASALAN: $\\underbrace{2222\\ldots2}_{50\\ \\text{ta raqam}}$ — bu \\underbrace{}_{} (pastki belgili) shakl, avtomatik $ bilan o'ralmaydi, butun ifodani qo'lda $ ... $ ichiga oling
- Rasmli savolda questionImage: null, questionText ga "(rasmga qarang)" yozing
- Jadvallar: qator-qator "ustun1 | ustun2\\nqiymat1 | qiymat2" formatida yozing (yoki <table> HTML) — MUHIM: agar javob varianti (options ichidagi bitta element)ning o'zi jadval bo'lsa (masalan x/y qiymatlar jadvali), o'sha variant matnini ham vergul bilan ajratilgan ro'yxat emas, aynan shu qator-qator formatda yozing: "x | y\\n-5 | 6\\n-6 | 9\\n-8 | -4"
- analysis: savolning TO'LIQ yechim tahlili (ixtiyoriy, lekin to'ldirilsa quyidagicha tuzilishda yozing): yechimni aniq qadamlarga bo'ling, har birini "1-qadam:", "2-qadam:" kabi belgilab boshlang; har bir qadamdan keyin bo'sh qator qoldiring (qadamlar orasida "\\n\\n" bo'lsin) — matn bir qatorga tiqilib qolmasin, o'qish oson bo'lsin; oxirida yakuniy javobni alohida qatorda "Javob: ..." deb ko'rsating. Formulalarni ham $x^2$, $\\dfrac{a}{b}$ kabi LaTeX bilan yozing — oddiy matn emas
- youtubeUrl: savol bo'yicha YouTube link (ixtiyoriy)`;
