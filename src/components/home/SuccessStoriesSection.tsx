import { Star } from "lucide-react";

const stories = [
  {
    name: "Abdulloh Karimov",
    score: "189/189",
    exam: "DTM",
    image: "/avatars/student1.jpg",
    text: "Saidxonov Academy testlari tufayli DTM da to'liq ball to'pladim. Haftalik testlar juda foydali bo'ldi.",
  },
  {
    name: "Malika Yusupova",
    score: "1480/1600",
    exam: "SAT",
    image: "/avatars/student2.jpg",
    text: "SAT testlariga tayyorgarlik jarayonida bu platforma menga juda katta yordam berdi.",
  },
  {
    name: "Jasur Toshmatov",
    score: "95/100",
    exam: "Milliy Sertifikat",
    image: "/avatars/student3.jpg",
    text: "Milliy Sertifikat imtihoniga 2 oy tayyorlandim. Natija ajoyib chiqdi!",
  },
];

export default function SuccessStoriesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Muvaffaqiyatli o'quvchilar
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Minglab talabalar allaqachon maqsadlariga erishdi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.name} className="bg-muted/30 rounded-2xl p-6 border border-border hover:shadow-md transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                "{story.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {story.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.exam} — {story.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}