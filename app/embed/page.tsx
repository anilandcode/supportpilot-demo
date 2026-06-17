import type { Metadata } from "next";
import { ChatWindow } from "@/components/chat/chat-window";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `${theme.productName} embed`,
  robots: "noindex, nofollow",
};

export default function EmbedPage() {
  return (
    <>
      {/*
        Transparent background so the host page shows through the iframe.
        The widget floats in the bottom-right corner of the iframe viewport.
      */}
      <style>{`
        html, body {
          background: transparent !important;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
      <main style={{ width: "100vw", height: "100vh" }}>
        <ChatWindow />
      </main>
    </>
  );
}
