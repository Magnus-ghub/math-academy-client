"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { MathText } from "@/components/MathText";

interface Props { onClose: () => void; }

interface Section {
  id: string;
  title: string;
  body: string;
}

// Manba: "Matematika fanidan asosiy formulalar" (Farrux Odilovdan sovg'a) —
// Milliy Sertifikat talabalari uchun to'liq formulalar to'plami. Har bir
// bo'lim bitta MathText chaqiruviga uzatiladi — $$...$$ har biri alohida
// blok formula, oddiy matn ichidagi $...$ esa aralash izohlar uchun.
const SECTIONS: Section[] = [
  {
    id: "tenglamalar",
    title: "Tenglamalar",
    body: `
$$ax^2+bx+c=0,\\quad x_{1,2}=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$
$$\\begin{cases}x_1+x_2=-\\dfrac{b}{a}\\\\ x_1\\cdot x_2=\\dfrac{c}{a}\\end{cases}$$
$$|f(x)|+|g(x)|=|f(x)+g(x)|\\ \\Rightarrow\\ f(x)\\cdot g(x)\\ge 0$$
$$\\dfrac{Ax}{ax^2\\pm bx-c}\\pm\\dfrac{Bx}{ax^2\\pm dx+c}=k$$
$$\\Rightarrow\\ \\dfrac{A}{ax-\\frac{c}{x}\\pm b}\\pm\\dfrac{B}{ax+\\frac{c}{x}\\pm d}=k$$
$$(ax^2\\pm bx-c)(ax^2\\pm dx+c)=Ax^2$$
$$\\Rightarrow\\ \\left(ax-\\dfrac{c}{x}\\pm b\\right)\\left(ax+\\dfrac{c}{x}\\pm d\\right)=A$$
$ax+\\dfrac{c}{x}=z$ o'zgaruvchi kiritib yechiladi
$$(x-a)(x-b)(x-c)(x-d)=A$$
$a+b=c+d$ bo'lsa, $t=x^2-(a+b)x$ o'zgaruvchi kiritib yechiladi
`,
  },
  {
    id: "qisqa-kopaytirish",
    title: "Qisqa ko'paytirish formulalari",
    body: `
$$a^2-b^2=(a-b)(a+b)$$
$$(a\\pm b)^2=a^2\\pm 2ab+b^2$$
$$(a\\pm b)^3=a^3\\pm 3a^2b+3ab^2\\pm b^3$$
$$a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2)$$
$$a^n-b^n=(a-b)(a^{n-1}+a^{n-2}b+\\dots+ab^{n-2}+b^{n-1})$$
$$a^{2n}\\pm b^{2n}=(a\\pm b)(a^{2n-1}\\mp a^{2n-2}b+\\dots+ab^{2n-2}\\mp b^{2n-1})$$
$$a^{2n+1}\\pm b^{2n+1}=(a\\pm b)(a^{2n}\\mp a^{2n-1}b+\\dots+ab^{2n-1}\\mp b^{2n})$$
$$(a+b)^n=a^n+na^{n-1}b+\\dfrac{n(n-1)}{2!}a^{n-2}b^2+\\dots$$
$$\\dots+\\dfrac{n(n-1)(n-2)\\cdots(n-(k-1))}{k!}a^{n-k}b^k+\\dots+nab^{n-1}+b^n$$
`,
  },
  {
    id: "arifmetik-progressiya",
    title: "Arifmetik progressiya",
    body: `
$$a_n=a_{n-1}+d=a_1+(n-1)d$$
$$a_n=\\dfrac{a_{n-k}+a_{n+k}}{2},\\quad 1\\le k\\le n-1$$
$$S_n=\\dfrac{a_1+a_n}{2}\\cdot n=\\dfrac{2a_1+d(n-1)}{2}\\cdot n$$
`,
  },
  {
    id: "geometrik-progressiya",
    title: "Geometrik progressiya",
    body: `
$$b_n=b_1\\cdot q^{n-1}$$
$$b_n^2=b_{n-m}\\cdot b_{n+m},\\quad 1\\le m\\le n-1$$
$$S_n=\\dfrac{b_1(1-q^n)}{1-q},\\ |q|>1$$
$$S_n=\\dfrac{b_1}{1-q},\\ |q|<1$$
`,
  },
  {
    id: "logarifm",
    title: "Logarifmning xossalari",
    body: `
$$\\log_a 1=0$$
$$\\log_a(x_1\\cdot x_2)=\\log_a|x_1|+\\log_a|x_2|$$
$$\\log_a\\dfrac{x_1}{x_2}=\\log_a|x_1|-\\log_a|x_2|$$
$$\\log_{a^q} x^p=\\dfrac{p}{q}\\cdot\\log_a x$$
$$\\log_a b=\\dfrac{\\log_c b}{\\log_c a}$$
$$\\log_a b=\\dfrac{1}{\\log_b a}$$
$$\\lg 10^n=n,\\qquad \\ln e^n=n$$
`,
  },
  {
    id: "daraja-ildiz",
    title: "Daraja va ildiz",
    body: `
$$a^n\\cdot a^m=a^{m+n},\\quad a^n:a^m=a^{m-n},\\quad (a^m)^n=a^{m\\cdot n}$$
$$(a\\cdot b)^n=a^n\\cdot b^n,\\qquad \\left(\\dfrac{a}{b}\\right)^n=\\dfrac{a^n}{b^n}$$
$$a^{-n}=\\dfrac{1}{a^n},\\qquad \\left(\\dfrac{a^n}{b^m}\\right)^{-k}=\\left(\\dfrac{b^m}{a^n}\\right)^k$$
$$(-a)^{2n}=a^{2n},\\qquad (-a)^{2n+1}=-a^{2n+1}$$
$a\\ne0,\\ b\\ne0,\\ m,n\\in N$
$$\\sqrt[n]{a^k}=a^{\\frac{k}{n}}$$
$$\\sqrt[n]{a^k\\cdot b^m}=\\sqrt[n]{a^k}\\cdot\\sqrt[n]{b^m}$$
$$\\sqrt[n]{\\dfrac{a^k}{b^m}}=\\dfrac{\\sqrt[n]{a^k}}{\\sqrt[n]{b^m}},\\quad b\\ne0$$
$$\\left(\\sqrt[n]{a^m}\\right)^k=\\sqrt[n]{a^{mk}}$$
$$\\sqrt[n]{a^{n+k}}=a\\sqrt[n]{a^k}$$
$$a^{-\\frac{k}{n}}=\\dfrac{1}{\\sqrt[n]{a^k}},\\quad a\\ne0$$
$$\\sqrt[m]{\\sqrt[n]{a^k}}=\\sqrt[nm]{a^k}$$
$$\\sqrt[n]{a^k}\\cdot\\sqrt[p]{b^m}=\\sqrt[nm]{a^{km}\\cdot b^{pn}}$$
$$\\sqrt[n]{a^n}=\\begin{cases}|a|, & n=2k,\\ k\\in N\\\\ a, & n=2k+1,\\ k\\in N\\end{cases}$$
$$\\sqrt[2n]{(a-b)^{2n}}=\\begin{cases}a-b, & a\\ge b\\\\ b-a, & b\\ge a\\end{cases}$$
`,
  },
  {
    id: "urinma-normal",
    title: "Urinma va normal tenglamasi",
    body: `
$$y=f(x_0)+f'(x_0)(x-x_0)$$
$$y=f(x_0)-\\dfrac{1}{f'(x_0)}(x-x_0)$$
`,
  },
  {
    id: "hosila-jadval",
    title: "Hosilaga doir formulalar",
    body: `
$$(x^a)'=ax^{a-1},\\qquad (a^x)'=a^x\\ln a,\\qquad (e^x)'=e^x$$
$$(\\log_a x)'=\\dfrac{1}{x\\ln a},\\qquad (\\ln x)'=\\dfrac{1}{x}$$
$$(\\sin x)'=\\cos x,\\qquad (\\cos x)'=-\\sin x$$
$$(\\operatorname{tg}x)'=\\dfrac{1}{\\cos^2 x},\\qquad (\\operatorname{ctg}x)'=-\\dfrac{1}{\\sin^2 x}$$
`,
  },
  {
    id: "hosila-xossalari",
    title: "Hosilaning xossalari",
    body: `
$$(u(x)\\pm v(y))'=u'(x)\\pm v'(y)$$
$$(k\\cdot u(x))'=k\\cdot u'(x),\\quad (k=const)$$
$$(u(x)\\cdot v(y))'=u'(x)\\cdot v(y)+u(x)\\cdot v'(y)$$
$$\\left(\\dfrac{u(x)}{v(y)}\\right)'=\\dfrac{u'(x)\\cdot v(y)-u(x)\\cdot v'(y)}{(v(y))^2}$$
`,
  },
  {
    id: "integral-jadval",
    title: "Integralga doir formulalar",
    body: `
$$\\int x^n\\,dx=\\dfrac{x^{n+1}}{n+1}+C$$
$$\\int \\dfrac{dx}{x}=\\ln|x|+C$$
$$\\int e^x\\,dx=e^x+C$$
$$\\int a^x\\,dx=\\dfrac{a^x}{\\ln a}+C$$
$$\\int \\sin x\\,dx=-\\cos x+C$$
$$\\int \\cos x\\,dx=\\sin x+C$$
`,
  },
  {
    id: "integral-xossalari",
    title: "Integrallarning xossalari",
    body: `
$$\\int k\\cdot f(x)\\,dx=k\\cdot\\int f(x)\\,dx$$
$$\\int (f(x)+g(x))\\,dx=\\int f(x)\\,dx+\\int g(x)\\,dx$$
$$\\int_{-a}^{a} f(x)\\,dx=0$$
$$\\int_a^b f(x)\\,dx=F(x)\\Big|_{a}^{b}=F(b)-F(a)$$
$$\\int_a^b f(x)\\,dx=-\\int_b^a f(x)\\,dx$$
$$\\int_a^b f(x)\\,dx=\\int_a^c f(x)\\,dx+\\int_c^b f(x)\\,dx,\\quad (a\\le c\\le b)$$
`,
  },
  {
    id: "orta-arifmetik-geometrik",
    title: "O'rta arifmetik va o'rta geometrik",
    body: `
$$A=\\dfrac{a_1+a_2+\\dots+a_n}{n}$$
$$G=\\sqrt[n]{a_1\\cdot a_2\\cdot\\dots\\cdot a_n}$$
`,
  },
  {
    id: "trigonometrik-formulalar",
    title: "Ba'zi trigonometrik formulalar",
    body: `
$$\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta$$
$$\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta$$
$$\\operatorname{tg}(\\alpha\\pm\\beta)=\\dfrac{\\operatorname{tg}\\alpha\\pm\\operatorname{tg}\\beta}{1\\mp\\operatorname{tg}\\alpha\\cdot\\operatorname{tg}\\beta}$$
$$\\operatorname{ctg}(\\alpha\\pm\\beta)=\\dfrac{\\operatorname{ctg}\\alpha\\cdot\\operatorname{ctg}\\beta\\mp1}{\\operatorname{ctg}\\alpha\\pm\\operatorname{ctg}\\beta}$$
$$\\sin\\alpha+\\sin\\beta=2\\sin\\dfrac{\\alpha+\\beta}{2}\\cos\\dfrac{\\alpha-\\beta}{2}$$
$$\\sin\\alpha-\\sin\\beta=2\\sin\\dfrac{\\alpha-\\beta}{2}\\cos\\dfrac{\\alpha+\\beta}{2}$$
$$\\cos\\alpha+\\cos\\beta=2\\cos\\dfrac{\\alpha+\\beta}{2}\\cos\\dfrac{\\alpha-\\beta}{2}$$
$$\\cos\\alpha-\\cos\\beta=-2\\sin\\dfrac{\\alpha+\\beta}{2}\\sin\\dfrac{\\alpha-\\beta}{2}$$
`,
  },
  {
    id: "trigonometrik-ayniyatlar",
    title: "Asosiy trigonometrik ayniyatlar",
    body: `
$$\\sin^2\\alpha+\\cos^2\\alpha=1$$
$$\\operatorname{tg}\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha},\\qquad \\operatorname{ctg}\\alpha=\\dfrac{\\cos\\alpha}{\\sin\\alpha}$$
$$\\operatorname{tg}^2\\alpha+1=\\dfrac{1}{\\cos^2\\alpha},\\qquad \\operatorname{ctg}^2\\alpha+1=\\dfrac{1}{\\sin^2\\alpha}$$
`,
  },
  {
    id: "burchak-qiymatlari",
    title: "Ba'zi burchaklardagi qiymatlar",
    body: "",
  },
  {
    id: "ixtiyoriy-uchburchak",
    title: "Ixtiyoriy uchburchak uchun formulalar",
    body: `
$$S=\\dfrac{1}{2}ab\\sin\\gamma$$
$$S=\\sqrt{p(p-a)(p-b)(p-c)}$$
$$p=\\dfrac{1}{2}(a+b+c),\\qquad S=\\dfrac{1}{2}h_c\\cdot c$$
$$\\dfrac{\\sin\\alpha}{a}=\\dfrac{\\sin\\beta}{b}=\\dfrac{\\sin\\gamma}{c}$$
$$a^2=b^2+c^2-2bc\\cos\\alpha$$
`,
  },
  {
    id: "togri-burchakli-uchburchak",
    title: "To'g'ri burchakli uchburchak uchun formulalar",
    body: `
$$a^2+b^2=c^2$$
$$a=c\\cdot\\sin\\alpha,\\qquad b=c\\cdot\\cos\\alpha,\\qquad a=b\\cdot\\operatorname{tg}\\alpha$$
`,
  },
  {
    id: "aylana-radiuslari",
    title: "Ichki va tashqi chizilgan aylana radiuslari",
    body: `
$$r=\\dfrac{2S}{a+b+c}$$
$$R=\\dfrac{abc}{4S}$$
$$R=\\dfrac{a}{2\\sin\\alpha}=\\dfrac{b}{2\\sin\\beta}=\\dfrac{c}{2\\sin\\gamma}$$
`,
  },
  {
    id: "tortburchak-yuzi",
    title: "To'rtburchakning yuzlari uchun formulalar",
    body: `
Parallelogramm: $$S=a\\cdot h_a,\\qquad S=a\\cdot b\\cdot\\sin\\alpha$$
Romb: $$S=\\dfrac{1}{2}d_1 d_2,\\qquad S=a^2\\sin\\alpha$$
Trapetsiya: $$S=\\dfrac{a+b}{2}\\cdot h$$
`,
  },
  {
    id: "vektorlar",
    title: "Vektorlar",
    body: `
Vektorning uzunligi $\\vec a(x;y;z)$: $$|\\vec a|=\\sqrt{x^2+y^2+z^2}$$
Skalyar ko'paytma: $$\\vec a\\cdot\\vec b=|\\vec a|\\cdot|\\vec b|\\cdot\\cos\\varphi$$
$\\vec a(x_1;y_1)$ va $\\vec b(x_2;y_2)$ vektorlarning skalyar ko'paytmasi:
$$\\vec a\\cdot\\vec b=x_1x_2+y_1y_2$$
$$\\vec a\\cdot\\lambda=\\vec c(x\\lambda;\\ y\\lambda;\\ z\\lambda)$$
`,
  },
  {
    id: "aylana-doira",
    title: "Aylana va doira",
    body: `
$$l=2\\pi R$$
$$S=\\pi R^2$$
`,
  },
  {
    id: "sektor-segment",
    title: "Doiraviy sektor va segment yuzi",
    body: `
$$S_{sektor}=\\dfrac{\\pi R^2}{360}\\cdot\\alpha$$
$$S_{segment}=\\dfrac{R^2}{2}(\\alpha-\\sin\\alpha)$$
`,
  },
  {
    id: "stereometriya",
    title: "Stereometriya formulalari",
    body: `
Prizma: $$V=SH$$
Piramida: $$V=\\dfrac{1}{3}SH$$
Kesik piramida: $$V=\\dfrac{1}{3}h\\left(S_1+\\sqrt{S_1\\cdot S_2}+S_2\\right)$$
Silindr: $$S_{yon}=2\\pi RH,\\qquad V=\\pi R^2H$$
Konus: $$S_{yon}=\\pi R^2,\\qquad V=\\dfrac{1}{3}\\pi R^2H$$
Kesik konus: $$V=\\dfrac{1}{3}\\pi h\\left(R_1^2+R_1R_2+R_2^2\\right)$$
Shar: $$S=4\\pi R^2,\\qquad V=\\dfrac{4}{3}\\pi R^3$$
Shar segmentining hajmi: $$V=\\pi H^2\\left(R-\\dfrac{H}{3}\\right)$$
Shar segmentining sirt yuzi: $$S=2\\pi RH$$
`,
  },
];

function BurchakTable() {
  const cols = [
    { a: "0", s: "0", c: "1" },
    { a: "\\dfrac{\\pi}{6}", s: "\\dfrac{1}{2}", c: "\\dfrac{\\sqrt3}{2}" },
    { a: "\\dfrac{\\pi}{4}", s: "\\dfrac{\\sqrt2}{2}", c: "\\dfrac{\\sqrt2}{2}" },
    { a: "\\dfrac{\\pi}{3}", s: "\\dfrac{\\sqrt3}{2}", c: "\\dfrac{1}{2}" },
    { a: "\\dfrac{\\pi}{2}", s: "1", c: "0" },
  ];
  return (
    <table className="w-full text-center border-collapse">
      <tbody>
        <tr>
          <td className="p-1.5 text-xs font-bold text-muted-foreground border border-border">α</td>
          {cols.map((c, i) => (
            <td key={i} className="p-1.5 border border-border"><MathText text={`$${c.a}$`} /></td>
          ))}
        </tr>
        <tr>
          <td className="p-1.5 text-xs font-bold text-muted-foreground border border-border">sinα</td>
          {cols.map((c, i) => (
            <td key={i} className="p-1.5 border border-border"><MathText text={`$${c.s}$`} /></td>
          ))}
        </tr>
        <tr>
          <td className="p-1.5 text-xs font-bold text-muted-foreground border border-border">cosα</td>
          {cols.map((c, i) => (
            <td key={i} className="p-1.5 border border-border"><MathText text={`$${c.c}$`} /></td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export function MilliyFormulaSheet({ onClose }: Props) {
  const [active, setActive] = useState(SECTIONS[0].id);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(`formula-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* Right sidebar */}
      <div className="fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-md flex flex-col bg-background shadow-2xl border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="font-bold text-sm text-primary">Formulalar to&apos;plami</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick nav chips */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto shrink-0">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              title={s.title}
              className={`shrink-0 w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                active === s.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              id={`formula-${s.id}`}
              className="rounded-xl border border-border overflow-hidden scroll-mt-2"
            >
              <div className="px-3 py-2 bg-primary/10 border-b border-border">
                <p className="text-xs font-bold text-primary">{s.title}</p>
              </div>
              <div className="px-3 py-3 text-sm space-y-2 [&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
                {s.id === "burchak-qiymatlari" ? (
                  <BurchakTable />
                ) : (
                  <MathText text={s.body} />
                )}
              </div>
            </div>
          ))}

          <p className="text-[11px] text-center text-muted-foreground pt-2 pb-4">
            Bu formulalar yordam sifatida tavsiya qilinadi. Farrux Odilovdan sovg&apos;a.
          </p>
        </div>
      </div>
    </>
  );
}
