import { UserCheck, BookOpen, BarChart3, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    step: "01",
    title: "Ro'yxatdan o'ting",
    desc: "Telegram yoki Google orqali tezda kirish. Hech qanday murakkab jarayon yo'q.",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Test tanlang",
    desc: "DTM, SAT, Milliy Sertifikat yoki Attestatsiya — kerakli test turini tanlang.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Natijani ko'ring",
    desc: "Test tugagach darhol natija va tahlil. Qaysi mavzuda zaif ekanligingizni bilib oling.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Maqsadga erishing",
    desc: "Muntazam mashq va tahlil orqali imtihonda yuqori ball to'plang.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Qanday ishlaydi?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            4 oddiy qadamda maqsadingizga erishing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-border z-0" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                {/* <span className="text-4xl font-black text-primary/20 absolute -top-2 -right-2">{step.step}</span> */}
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}