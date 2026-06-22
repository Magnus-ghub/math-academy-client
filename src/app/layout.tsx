// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ApolloClientProvider } from "@/providers/apollo-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "katex/dist/katex.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saidxonov Academy",
  description: "O'zbekistondagi eng yaxshi matematika o'quv markazi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header va Footer bu yerdan olib tashlandi, ular endi guruhli layoutlarda bo'ladi */}
          <ApolloClientProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ApolloClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
