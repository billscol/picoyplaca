import { CalendarClock, Leaf, Coins } from "lucide-react";
import type { RestrictionModel } from "@/lib/pico-placa";

export const MODEL_ICON: Record<RestrictionModel, typeof CalendarClock> = {
  plate_digit_day: CalendarClock,
  emission_label_zone: Leaf,
  congestion_charge: Coins,
};

/** Chip de icono por modelo — el verde acido sigue siendo el acento dominante (la mayoria de
 * ciudades son plate_digit_day); vermillion/magenta se usan aqui como toque decorativo en
 * iconografia, tal como permite el style guide, nunca como fondo de superficie a escala. */
export const MODEL_CHIP_CLASS: Record<RestrictionModel, string> = {
  plate_digit_day: "bg-primary/20 text-foreground",
  emission_label_zone: "bg-vermillion/10 text-vermillion",
  congestion_charge: "bg-magenta-pop/10 text-magenta-pop",
};
