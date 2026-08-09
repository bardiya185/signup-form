import {
  Armchair, BookOpen, Camera, Disc3, Footprints, Gamepad2, Grid2X2, Headphones,
  Laptop, Refrigerator, Shirt, Smartphone, Sparkles, Tv, Watch, Droplets, Wind, Briefcase, type LucideIcon,
} from 'lucide-react';

export const categoriesIcons: Record<string, LucideIcon> & { default: LucideIcon } = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  camera: Camera,
  watch: Watch,
  'gamepad-2': Gamepad2,
  'disc-3': Disc3,
  shirt: Shirt,
  footprints: Footprints,
  briefcase: Briefcase,
  armchair: Armchair,
  refrigerator: Refrigerator,
  tv: Tv,
  'book-open': BookOpen,
  sparkles: Sparkles,
  droplets: Droplets,
  wind: Wind,
  default: Grid2X2,
};
