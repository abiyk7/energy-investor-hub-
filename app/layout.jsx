export const metadata = {
  title: "Energy Investor Hub",
  description:
    "AI-powered energy market intelligence, portfolio builder, and investor briefing.",
  other: {
    "google-adsense-account": "ca-pub-3296040027829512",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
