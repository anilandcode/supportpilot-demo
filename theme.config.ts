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
    accent: "#6D56FF",
    fg: "#0F172A",
    bg: "#FCFCFD",
    surface: "#F8FAFC",
    card: "#ffffff",
    bubbleUser: "#F4F2FF",
  },
  semantic: {
    statusNew: "#6366F1",
    statusProgress: "#3B82F6",
    statusResolved: "#22C55E",
    priorityLow: "#94A3B8",
    priorityMedium: "#3B82F6",
    riskHigh: "#F97316",
    riskCritical: "#DC2626",
    confidenceHigh: "#22C55E",
    confidenceMid: "#F59E0B",
    confidenceLow: "#EF4444",
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
