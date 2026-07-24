import {
  Archive,
  Compass,
  Home,
  Mail,
  ShieldCheck,
  SquarePen,
  UserRound,
} from "lucide-react";

export const navigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Capsules", href: "/capsules", icon: Archive },
  { label: "Open letters", href: "/explore#open-letters", icon: Mail },
  { label: "Safety", href: "/settings/safety", icon: ShieldCheck },
];

export const mobileNavigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Write", href: "/compose", icon: SquarePen },
  { label: "Capsules", href: "/capsules", icon: Archive },
  { label: "You", href: "/settings/safety", icon: UserRound },
];
