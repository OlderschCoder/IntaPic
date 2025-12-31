import eiffelTower from "@assets/generated_images/eiffel_tower_romantic_dusk.png";
import snowyMountain from "@assets/generated_images/snowy_mountain_sunset_view.png";
import romanticRestaurant from "@assets/generated_images/romantic_candlelit_restaurant_interior.png";
import cozyFireplace from "@assets/generated_images/cozy_fireplace_warm_glow.png";
import tropicalBeach from "@assets/generated_images/tropical_beach_sunset_palms.png";
import enchantedGarden from "@assets/generated_images/enchanted_garden_fairy_lights.png";

export interface Background {
  id: string;
  name: string;
  image: string | null;
}

export const scenicBackgrounds: Background[] = [
  {
    id: "none",
    name: "No Background",
    image: null,
  },
  {
    id: "eiffel-tower",
    name: "Eiffel Tower",
    image: eiffelTower,
  },
  {
    id: "snowy-mountain",
    name: "Snowy Mountain",
    image: snowyMountain,
  },
  {
    id: "romantic-restaurant",
    name: "Romantic Restaurant",
    image: romanticRestaurant,
  },
  {
    id: "cozy-fireplace",
    name: "Cozy Fireplace",
    image: cozyFireplace,
  },
  {
    id: "tropical-beach",
    name: "Tropical Beach",
    image: tropicalBeach,
  },
  {
    id: "enchanted-garden",
    name: "Enchanted Garden",
    image: enchantedGarden,
  },
];

export function getBackgroundById(id: string): Background {
  return scenicBackgrounds.find(bg => bg.id === id) || scenicBackgrounds[0];
}
