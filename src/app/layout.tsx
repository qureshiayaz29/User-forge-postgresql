import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "UserForge - PostgreSQL Learning",
  description: "Learn PostgreSQL through hands-on user data management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <nav className="bg-slate-900 text-white py-4 shadow-lg">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-2xl font-bold">
              <Link href="/" className="hover:text-blue-400">
                UserForge
              </Link>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Learn PostgreSQL by building real applications
            </p>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto py-8 px-6">
          {children}
        </main>
        <footer className="bg-slate-100 border-t border-slate-200 mt-12 py-6">
          <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-600">
            <p>UserForge v1.0 - PostgreSQL Learning Platform</p>
          </div>
        </footer>
      </body>
    </html>
  );
}


