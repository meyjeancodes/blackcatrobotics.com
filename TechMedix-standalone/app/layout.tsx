import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechMedix",
  description: "BlackCat Robotics maintenance intelligence platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=tanker@400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-ink">
        {children}
      </body>
    </html>
  );
}
