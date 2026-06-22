export type SupportPilotTheme = {
  productName: string;
  botName: string;
  company: string;
  logoUrl: string;
  avatarUrl: string;
  colors: {
    accent: string;
    fg: string;
    bg: string;
    surface: string;
    card: string;
    bubbleUser: string;
  };
  semantic: {
    statusNew: string;
    statusProgress: string;
    statusResolved: string;
    priorityLow: string;
    priorityMedium: string;
    riskHigh: string;
    riskCritical: string;
    confidenceHigh: string;
    confidenceMid: string;
    confidenceLow: string;
  };
  font: string;
  radius: number;
  mode: "light" | "dark" | "auto";
  welcome: string;
  suggestions: string[];
  escalation: {
    type: "calendly" | "email" | "slack";
    url: string;
    label: string;
  };
  disclaimer: string;
  tier: "lite" | "enterprise";
};

export const theme = {
  productName: "SupportPilot",
  botName: "Pilot",
  company: "AcmeDesk",
  logoUrl: "",
  avatarUrl: "",
  colors: {
    accent: "#2563eb",
    fg: "#0a0a0a",
    bg: "#ffffff",
    surface: "#f6f8fb",
    card: "#ffffff",
    bubbleUser: "#eef2ff",
  },
  semantic: {
    statusNew: "#2563eb",
    statusProgress: "#7c3aed",
    statusResolved: "#059669",
    priorityLow: "#64748b",
    priorityMedium: "#d97706",
    riskHigh: "#ea580c",
    riskCritical: "#dc2626",
    confidenceHigh: "#059669",
    confidenceMid: "#d97706",
    confidenceLow: "#dc2626",
  },
  font: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  radius: 16,
  mode: "light",
  welcome: "Hi, I'm Pilot. Ask me anything about AcmeDesk pricing, integrations, billing, or security.",
  suggestions: [
    "How much is Pro?",
    "Do you integrate with GitHub?",
    "What is the refund policy?",
    "Is AcmeDesk SOC 2 certified?",
  ],
  escalation: {
    type: "calendly",
    url: "https://calendly.com/anilpervaiz/15min",
    label: "Talk to a human",
  },
  disclaimer: "",
  tier: "lite",
} as const satisfies SupportPilotTheme;
