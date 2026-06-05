import Link from 'next/link';

const footerLinks = {
  Platform: [
    { href: '#features', label: 'Features' },
    { href: '#plans', label: 'Pricing' },
    { href: '#how-it-works', label: 'How it works' },
  ],
  Account: [
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Register' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  Support: [
    { href: 'mailto:support@cdielts.uz', label: 'Contact' },
    { href: '#', label: 'FAQ' },
    { href: '#', label: 'Telegram' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/jamshid_logo.jpg" alt="CD IELTS" className="h-9 w-auto" />
              <span className="font-bold text-white text-lg">Saidxonov Academy</span>
            </div>
            <p className="text-sm leading-relaxed">
              The most advanced IELTS mock test platform.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© 2026 Saidxonov Academy. All rights reserved.</p>
          <p className="text-xs">
            <span className="text-primary font-semibold">Saidxonov Academy</span> — Math preparation platform
          </p>
        </div>
      </div>
    </footer>
  );
}
