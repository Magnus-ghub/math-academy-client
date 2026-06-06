import { GraduationCap } from "lucide-react";

const teachers = [
  {
    name: "Jamshid Saidxonov",
    role: "Matematika o'qituvchisi",
    experience: "10+ yil tajriba",
    students: "5000+ talaba",
    desc: "DTM va xalqaro imtihonlar bo'yicha mutaxassis.",
  },
  {
    name: "Bobur Rahimov",
    role: "Algebra va Geometriya",
    experience: "7+ yil tajriba",
    students: "2000+ talaba",
    desc: "Olimpiada matematikasi va chuqur tahlil bo'yicha ekspert.",
  },
  {
    name: "Sarvinoz Nazarova",
    role: "SAT Math mutaxassisi",
    experience: "5+ yil tajriba",
    students: "1500+ talaba",
    desc: "Xalqaro standartlar asosida matematika o'qitish.",
  },
];

export default function TeachersSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O'qituvchilarimiz
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tajribali va malakali o'qituvchilar jamoasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher.name} className="bg-background rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-1">{teacher.name}</h3>
              <p className="text-accent font-medium text-sm mb-3">{teacher.role}</p>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{teacher.desc}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>📅 {teacher.experience}</span>
                <span>👨‍🎓 {teacher.students}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}