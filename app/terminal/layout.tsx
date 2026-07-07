// Standalone terminal layout — no navbar, full viewport, no padding
// Designed for mobile use (Termux browser, iOS Safari, Android Chrome)

export const metadata = {
  title: "Terminal — 144,000 Color Project",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  // Override the root layout's pt-16 (navbar offset) by rendering children directly
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {children}
    </div>
  );
}
