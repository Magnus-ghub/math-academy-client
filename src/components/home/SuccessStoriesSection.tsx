import Image from "next/image";
import { Trophy } from "lucide-react";

const students = [
  {
    image: "/images/student1.jpg",
    name: "Abdulloh Karimov",
    exam: "DTM",
    score: "189/189",
    year: "2025",
    text: "Saidxonov Academy testlari tufayli DTM da to'liq ball to'pladim.",
  },
  {
    image: "/images/student2.jpg",
    name: "Malika Yusupova",
    exam: "SAT",
    score: "1480/1600",
    year: "2025",
    text: "SAT ga tayyorgarlik jarayonida bu platforma menga juda katta yordam berdi.",
  },
  {
    image: "/images/student3.jpg",
    name: "Jasur Toshmatov",
    exam: "Milliy Sertifikat",
    score: "95/100",
    year: "2025",
    text: "Milliy Sertifikat imtihoniga 2 oy tayyorlandim. Natija ajoyib chiqdi!",
  },
  {
    image: "/images/student4.jpeg",
    name: "Dilnoza Rahimova",
    exam: "DTM",
    score: "185/189",
    year: "2026",
    text: "Haftalik guruh testlari juda samarali bo'ldi. Tavsiya qilaman!",
  },
];

export default function SuccessStoriesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Muvaffaqiyatli o'quvchilar
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Minglab talabalar allaqachon maqsadlariga erishdi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {students.map((student) => (
            <div
              key={student.name}
              className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Sertifikat rasmi */}
              <div className="relative w-full aspect-3/4 bg-muted">
                <Image
                  src={student.image}
                  alt={`${student.name} sertifikati`}
                  fill
                  className="object-cover"
                />
                {/* Score badge */}
                <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {student.score}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold text-accent">{student.exam} — {student.year}</span>
                </div>
                <h3 className="font-bold text-sm mb-2">{student.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "{student.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}