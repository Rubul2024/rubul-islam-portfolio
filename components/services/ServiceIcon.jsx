import {
  Calculator,
  Globe,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Store,
  Truck,
} from "lucide-react";

// Icon keys used in data/services.js → Lucide icons.
const icons = {
  globe: Globe,
  dashboard: LayoutDashboard,
  cart: ShoppingCart,
  shield: ShieldCheck,
  clinic: Stethoscope,
  truck: Truck,
  education: GraduationCap,
  calculator: Calculator,
  store: Store,
  community: HeartHandshake,
};

export default function ServiceIcon({ name, size = 20, className }) {
  const Icon = icons[name] ?? Globe;
  return <Icon size={size} aria-hidden="true" className={className} />;
}
