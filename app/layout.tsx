import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuFlow",
  description: "Offline-first digital menu and operations suite"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div aria-live="polite" aria-atomic="true" className="sr-only" />
        {children}
      </body>
    </html>
  );
}
