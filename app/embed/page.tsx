import type { Metadata } from "next";
import { ChatWidget } from "@/components/chat/chat-widget";

export const metadata: Metadata = {
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
      <ChatWidget />
    </>
  );
}
