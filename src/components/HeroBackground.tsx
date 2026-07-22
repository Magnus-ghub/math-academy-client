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
  {
    text: "a²+b²=c²",
    top: "6%",
    left: "78%",
    size: "26px",
    rotate: "6deg",
  },
  {
    text: "∫f(x)dx",
    top: "40%",
    left: "68%",
    size: "32px",
    rotate: "-6deg",
  },
  {
    text: "sin θ",
    top: "72%",
    left: "62%",
    size: "28px",
    rotate: "8deg",
  },
  {
    text: "lim",
    top: "48%",
    left: "94%",
    size: "30px",
    rotate: "-4deg",
  },
  {
    text: "y=mx+b",
    top: "5%",
    left: "4%",
    size: "26px",
    rotate: "-5deg",
  },
  {
    text: "Δx",
    top: "92%",
    left: "8%",
    size: "32px",
    rotate: "7deg",
  },
];

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">

      {/* Main Mesh Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-600/14 via-background to-blue-900/12 dark:from-blue-500/40 dark:via-background dark:to-blue-900/30" />

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
          className="absolute font-serif italic text-blue-700/45 dark:text-blue-400/40 select-none hidden lg:block"
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}
