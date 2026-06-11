/**
 * Minimal root layout — only <html>/<body>.
 * The marketing site's chrome (fonts, header/footer, Tailwind, metadata) lives
 * in the (site) route group so /studio renders clean, full-screen, with none of it.
 */
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
