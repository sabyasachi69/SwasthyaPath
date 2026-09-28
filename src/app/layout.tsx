import type { Metadata } from "next";
import Link from "next/link";
import { demoEnabled } from "@/lib/demo";
import Pwa from "@/components/Pwa";
import "./globals.css";
export const metadata: Metadata = {
  title: "SwasthyaPath • Care in Bhubaneswar",
  description:
    "Find verified care information and plan your next step in Bhubaneswar.",
  manifest: "/manifest.webmanifest",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Pwa />
        <a className="skip" href="#main">
          Skip to content
        </a>
        {demoEnabled() && (
          <div className="demo">
            DEMONSTRATION • Fictional facilities • No real referral or medical
            guidance
          </div>
        )}
        <header>
          <Link className="brand" href="/">
            <span className="brand-icon">✚</span> Swasthya<span>Path</span>
          </Link>
          <nav>
            <Link href="/account">Saved plans</Link>
            <a className="emergency" href="tel:108">
              Call 108
            </a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>Bhubaneswar, Odisha • Care navigation</span>
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
