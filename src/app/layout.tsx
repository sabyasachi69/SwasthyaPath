import type { Metadata } from "next";
import Link from "next/link";
import Pwa from "@/components/Pwa";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";
export const metadata: Metadata = {
  title: "SwasthyaPath • Care in Bhubaneswar",
  description:
    "Find hospitals, clinics, diagnostics and pharmacies near you in Bhubaneswar.",
  manifest: "/manifest.webmanifest",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  const release = (
    process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "local"
  ).slice(0, 7);
  const environment = process.env.VERCEL_ENV ?? process.env.APP_ENV ?? "development";
  return (
    <html lang="en">
      <body>
        <Pwa />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header>
          <Link className="brand" href="/">
            <span className="brand-icon">✚</span> Swasthya<span>Path</span>
          </Link>
          <nav>
            <Link href="/account">Saved plans</Link>
            <ThemeToggle />
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>Bhubaneswar, Odisha • Care navigation</span>
          <span className="release">{environment} • {release}</span>
          <Link href="/privacy">Privacy & data</Link>
          <Link href="/admin">Staff</Link>
          <a
            href="https://odisha.gov.in/en/contacts/emergency"
            target="_blank"
            rel="noreferrer"
          >
            Emergency source
          </a>
        </footer>
      </body>
    </html>
  );
}
