import "./globals.css";

export const metadata = {
  title: "Resume Builder SaaS",
  description: "Professional Resume Builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}