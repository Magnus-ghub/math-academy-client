const formulas = [
  {
    text: "f(x)=ax²+bx+c",
    top: "10%",
    left: "58%",
    size: "30px",
    rotate: "-8deg",
  },
  {
    text: "π",
    top: "25%",
    left: "90%",
    size: "60px",
    rotate: "10deg",
  },
  {
    text: "√x",
    top: "63%",
    left: "88%",
    size: "54px",
    rotate: "-8deg",
  },
  {
    text: "∑",
    top: "18%",
    left: "52%",
    size: "50px",
    rotate: "5deg",
  },
  {
    text: "∞",
    top: "85%",
    left: "48%",
    size: "34px",
    rotate: "0deg",
  },
];

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">

      {/* Main Mesh Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-background to-accent/6 dark:from-primary/15 dark:via-background dark:to-accent/8" />

      {/* Top Right Glow */}
      <div className="absolute -top-40 right-0 h-175 w-175 rounded-full bg-primary/20 dark:bg-primary/25 blur-[140px]" />

      {/* Bottom Left Glow */}
      <div className="absolute -bottom-48 -left-32 h-150 w-150 rounded-full bg-accent/20 dark:bg-accent/20 blur-[130px]" />

      {/* Center Glow */}
      <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 dark:bg-primary/20 blur-[120px]" />

      {/* Large Circle */}
      <div className="absolute right-24 top-32 h-125 w-125 rounded-full bg-linear-to-br from-primary/12 dark:from-primary/18 to-transparent" />

      {/* Bottom Right Curves */}
      <svg
        className="absolute bottom-0 right-0 w-137.5 opacity-40 text-primary/60 dark:text-primary/50"
        viewBox="0 0 600 400"
        fill="none"
      >
        {[0, 35, 70, 105, 140].map((v) => (
          <path
            key={v}
            d={`M600 ${400 - v}C420 ${300 - v} 250 ${280 - v} 0 ${380 - v}`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Left Bottom Wave */}
      <svg
        className="absolute bottom-0 left-0 w-112.5 opacity-30 text-primary/40 dark:text-primary/25"
        viewBox="0 0 500 220"
      >
        <path
          d="M0 220C100 80 180 80 280 150C340 190 430 190 500 120V220Z"
          fill="currentColor"
        />
      </svg>

      {/* Graph */}
      <svg
        className="absolute bottom-32 left-[45%] h-44 w-44 text-primary/50 dark:text-primary/45"
        viewBox="0 0 140 140"
        fill="none"
      >
        <path
          d="M20 120H120M20 120V20"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path
          d="M20 115C40 70 60 70 80 110C95 135 110 70 120 40"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Cube */}
      <svg
        className="absolute top-[42%] left-[56%] h-24 w-24 text-primary/50 dark:text-primary/45"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" />
        <polyline points="15,30 50,50 85,30" />
        <line x1="50" y1="50" x2="50" y2="90" />
      </svg>

      {/* Floating dots */}
      <div className="absolute right-40 top-1/2 h-4 w-4 rounded-full bg-primary/40 dark:bg-primary/50 blur-sm" />
      <div className="absolute left-[54%] top-[62%] h-6 w-6 rounded-full bg-accent/50 dark:bg-accent/50 blur-sm" />

      {/* Grid */}
      <div className="absolute top-20 right-10 grid grid-cols-6 gap-3 opacity-30 dark:opacity-40">
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        ))}
      </div>

      {/* Math Formula */}
      {formulas.map((item) => (
        <span
          key={item.text}
          style={{
            top: item.top,
            left: item.left,
            fontSize: item.size,
            transform: `rotate(${item.rotate})`,
          }}
          className="absolute font-serif italic text-primary/45 dark:text-primary/40 select-none hidden lg:block"
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}
