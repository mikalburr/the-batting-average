// Required for Next.js 14 App Router production builds on Node.js 23
// This file is intentionally minimal — all pages use the App Router
import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
