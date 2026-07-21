import Image from "next/image";

interface ExamWatermarkProps {
  // "fixed": butun ekranga (viewport) qadalgan, orqa foni shaffof
  // sahifalar uchun (masalan oddiy exam sahifasi).
  // "absolute": o'zining opaque foni bor konteyner ICHIDA birinchi farzand
  // sifatida ishlatiladi (konteyner "relative" bo'lishi kerak) — masalan
  // SAT sahifasidagi bg-[#f8f9fa] qutisi, u "fixed"ni butunlay yashirib
  // qo'yadi.
  mode?: "fixed" | "absolute";
}

// Muallif huquqini himoya qilish uchun test sahifasi ortida juda past
// shaffoflikdagi diagonal watermark — PDF eksportidagi kabi. O'qishga
// xalaqit bermasligi uchun opacity ~4% va pointer-events: none.
export default function ExamWatermark({ mode = "fixed" }: ExamWatermarkProps) {
  const rows = 6;
  const cols = 3;

  return (
    <div
      aria-hidden
      className={`${mode === "fixed" ? "fixed -z-10" : "absolute z-0"} inset-0 overflow-hidden pointer-events-none select-none`}
    >
      {/* Diagonal takrorlanuvchi brend nomi */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rotate-[-30deg] flex flex-col gap-16 whitespace-nowrap">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-16">
              {Array.from({ length: cols }).map((_, c) => (
                <span
                  key={c}
                  className="text-2xl md:text-3xl font-bold tracking-wide text-primary/5"
                >
                  SAIDXONOV ACADEMY
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Burchaklardagi logo */}
      <Image
        src="/logo.jpg"
        alt=""
        width={48}
        height={48}
        className="absolute top-4 left-4 rounded-lg opacity-[0.06]"
      />
      <Image
        src="/logo.jpg"
        alt=""
        width={48}
        height={48}
        className="absolute top-4 right-4 rounded-lg opacity-[0.06]"
      />
    </div>
  );
}
