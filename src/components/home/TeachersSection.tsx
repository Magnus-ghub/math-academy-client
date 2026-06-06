import Image from "next/image";

const teachers = [
  {
    image: "/images/teacher1.png",
    name: "Jamshid Saidxonov",
    role: "Matematika o'qituvchisi",
    subject: "DTM · SAT · Milliy Sertifikat",
    experience: "10+ yil",
    students: "5000+",
  },
  {
    image: "/images/teacher2.png",
    name: "Bobur Rahimov",
    role: "Algebra va Geometriya",
    subject: "DTM · Olimpiada",
    experience: "7+ yil",
    students: "2000+",
  },
  {
    image: "/images/teacher3.png",
    name: "Sarvinoz Nazarova",
    role: "SAT Math mutaxassisi",
    subject: "SAT · Xalqaro imtihonlar",
    experience: "5+ yil",
    students: "1500+",
  },
  {
    image: "/images/teacher4.png",
    name: "Sherzod Yusupov",
    role: "Attestatsiya mutaxassisi",
    subject: "Attestatsiya · Milliy Sertifikat",
    experience: "8+ yil",
    students: "3000+",
  },
];

export default function TeachersSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O'qituvchilarimiz
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tajribali va malakali o'qituvchilar jamoasi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.name}
              className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-muted">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-base mb-0.5">{teacher.name}</h3>
                <p className="text-accent text-xs font-medium mb-1">{teacher.role}</p>
                <p className="text-muted-foreground text-xs mb-3">{teacher.subject}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>📅 {teacher.experience}</span>
                  <span>👨‍🎓 {teacher.students}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}