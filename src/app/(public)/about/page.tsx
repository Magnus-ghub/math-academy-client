import { Trophy, Users, BookOpen, Target } from "lucide-react";
import Image from "next/image";

const stats = [
  { label: "Talabalar", value: "10K+", icon: Users },
  { label: "Testlar", value: "50K+", icon: BookOpen },
  { label: "Muvaffaqiyat", value: "95%", icon: Trophy },
  { label: "Yillik tajriba", value: "5+", icon: Target },
];

const values = [
  { title: "Sifat", desc: "Har bir test professional darajada tayyorlanadi va tekshiriladi." },
  { title: "Qulaylik", desc: "Istalgan vaqt, istalgan joydan testlarni ishlash imkoniyati." },
  { title: "Natija", desc: "Talabalarimizning 95% maqsadli imtihonlarida yuqori ball oladi." },
  { title: "Qo'llab-quvvatlash", desc: "O'qituvchilar va mentorlar doim yordam berishga tayyor." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-primary/5 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Saidxonov Academy haqida
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Biz 2023-yildan buyon O'zbekiston talabalariga DTM, SAT, Milliy Sertifikat
            va Attestatsiya imtihonlariga tayyorgarlik ko'rishda yordam berib kelmoqdamiz.
            Minglab talabalar bizning platformamiz orqali o'z maqsadlariga erishdi.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Bizning tarix</h2>
          <div className="prose prose-gray max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              Saidxonov Academy 2023-yilda Jamshid Saidxonov tomonidan tashkil etilgan.
              Dastlab kichik Telegram guruhlaridan boshlangan faoliyat bugun minglab
              talabalarni birlashtirgan yirik onlayn platformaga aylandi.
            </p>
            <p>
              Bizning maqsadimiz — har bir talabaga sifatli va qulay matematika ta'limini
              taqdim etish. Shu maqsadda biz professional o'qituvchilar jamoasini tashkil
              etib, zamonaviy test platformasini yaratdik.
            </p>
            <p>
              Bugun Saidxonov Academy O'zbekistondagi eng yirik matematika tayyorgarlik
              platformalaridan biri sifatida tan olingan.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Bizning qadriyatlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="bg-background rounded-2xl border border-border p-6">
                <h3 className="font-bold text-lg mb-2 text-primary">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}