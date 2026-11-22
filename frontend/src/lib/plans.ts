// Single place to edit plans. All values are PROPOSED until pricing is decided.
export type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  audience: string;
  features: string[];
};

// Which plan the signed-in person is on. Everyone starts on Starter for now.
export const CURRENT_PLAN_ID = "starter";

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "free",
    audience: "For individuals getting started with general health questions.",
    features: [
      "General health conversations",
      "Saved conversation history",
      "Keep reports and scans in one list",
      "Safety reminders",
    ],
  },
  {
    id: "plus",
    name: "Cura Plus",
    price: "$19",
    period: "per month",
    audience: "For people who use Cura AI regularly and want more room.",
    features: [
      "Everything in Starter",
      "Longer conversation history",
      "Higher usage limits",
      "Priority access to new features",
    ],
  },
  {
    id: "clinical",
    name: "Clinical",
    price: "Custom",
    period: "contact us",
    audience: "For clinics and teams that need shared controls.",
    features: [
      "Everything in Cura Plus",
      "Team accounts",
      "Admin controls",
      "Dedicated support",
    ],
  },
];