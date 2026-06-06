import { menuItems } from "./menuData";
import type { MenuItem } from "@/store/useStore";

export type BaseId = "cone" | "cup";

const FLAVOR_IDS = [
  "bloody-mangue",
  "nuage-violet",
  "vanille",
  "sorbet-mojito",
  "pistache",
  "praline",
  "pate-a-biscuit",
];

export const BUILDER_FLAVORS: MenuItem[] = FLAVOR_IDS
  .map(id => menuItems.find(m => m.id === id))
  .filter((m): m is MenuItem => Boolean(m));

export const BUILDER_BASES: { id: BaseId; labelFr: string }[] = [
  { id: "cone", labelFr: "Cornet" },
  { id: "cup",  labelFr: "Coupe"  },
];
