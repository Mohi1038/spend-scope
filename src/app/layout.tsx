import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendScope | Free AI Spend Auditor & Optimization Calculator",
  description: "Audit your startup's AI tool subscriptions (Cursor, Claude, Copilot, ChatGPT) in seconds. Find plan redundancies, seat misalignments, and claim discounted credits.",
  metadataBase: new URL("https://spendscope.rocks"),
  openGraph: {
    title: "SpendScope | Free AI Spend Auditor & Savings Engine",
    description: "Audit your startup's AI tool spend in seconds. Find redundancies, seat misalignments, and claim discounted credits.",
    url: "https://spendscope.rocks",
    siteName: "SpendScope by Credex",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpendScope AI Spend Audit Summary",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendScope | Free AI Spend Auditor & Savings Engine",
    description: "Audit your startup's AI tool spend. Discover redundancies, optimal plans, and claim discounted credits.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Sticky Premium Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-lg">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Spend<span className="text-zinc-400">Scope</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://credex.rocks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Sourced by</span>
                <span className="font-black px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                  Credex
                </span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col justify-start">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/5 bg-black/80 py-8 text-center text-sm text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} SpendScope. Sourced by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-semibold">Credex</a>.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="https://credex.rocks" className="hover:text-gray-300 transition-colors">Contact Credex</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
