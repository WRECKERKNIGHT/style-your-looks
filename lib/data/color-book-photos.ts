/**
 * Real stock photography for Color Book outfits.
 *
 * Every URL is a stable Unsplash CDN image (free to use under the Unsplash
 * License) that was HEAD-verified at build-authoring time. Photos give the
 * mood/reference for each outfit; the color chips rendered alongside them
 * carry the exact traditional Japanese hex values, which is the point of
 * the book.
 */
export interface ComboPhoto {
  url: string;
  alt: string;
  credit: string;
}

const unsplash = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=72`;

export const COMBO_PHOTOS: Record<string, ComboPhoto> = {
  "m-sakura-business": {
    url: unsplash("1507679799987-c73779587ccf"),
    alt: "Man in a tailored business suit adjusting his tie",
    credit: "Unsplash",
  },
  "m-moegi-casual": {
    url: unsplash("1488161628813-04466f872be2"),
    alt: "Man in a casual jacket on a city street",
    credit: "Unsplash",
  },
  "m-ai-shiro-linen": {
    url: unsplash("1520975954732-35dd22299614"),
    alt: "Man wearing a crisp white shirt in bright daylight",
    credit: "Unsplash",
  },
  "m-sora-breeze": {
    url: unsplash("1602810318383-e386cc2a3ccf"),
    alt: "Man in a relaxed heather t-shirt against a neutral wall",
    credit: "Unsplash",
  },
  "m-momiji-layers": {
    url: unsplash("1576566588028-4147f3842f27"),
    alt: "Man in warm tan autumn-toned clothing",
    credit: "Unsplash",
  },
  "m-kuri-heritage": {
    url: unsplash("1593030761757-71fae45fa0e7"),
    alt: "Man in a structured grey blazer, heritage styling",
    credit: "Unsplash",
  },
  "m-kon-formal": {
    url: unsplash("1594938298603-c8148c4dae35"),
    alt: "Man in a deep navy formal suit",
    credit: "Unsplash",
  },
  "m-ebicha-evening": {
    url: unsplash("1551028719-00167b16eac5"),
    alt: "Man in a dark leather jacket for evening wear",
    credit: "Unsplash",
  },
  "w-hanami-dress": {
    url: unsplash("1515372039744-b8f02a3ae446"),
    alt: "Woman in a flowing spring dress outdoors",
    credit: "Unsplash",
  },
  "w-fuji-mist": {
    url: unsplash("1434389677669-e08b4cac3105"),
    alt: "Woman in a soft minimal pale coat",
    credit: "Unsplash",
  },
  "w-mizu-cool": {
    url: unsplash("1469334031218-e382a71b716b"),
    alt: "Woman in cool-toned summer fashion with sunglasses",
    credit: "Unsplash",
  },
  "w-sora-picnic": {
    url: unsplash("1483985988355-763728e1935b"),
    alt: "Woman in a bright day-trip outfit walking with shopping bags",
    credit: "Unsplash",
  },
  "w-momiji-wrap": {
    url: unsplash("1490725263030-1f0521cec8ec"),
    alt: "Woman wrapped in a chunky knit sweater among autumn leaves",
    credit: "Unsplash",
  },
  "w-matcha-latte": {
    url: unsplash("1564859228273-274232fdb516"),
    alt: "Woman in a warm beige blazer, café-ready styling",
    credit: "Unsplash",
  },
  "w-beni-statement": {
    url: unsplash("1520006403909-838d6b92c22e"),
    alt: "Woman in a striking red statement garment",
    credit: "Unsplash",
  },
  "w-gunjo-elegance": {
    url: unsplash("1539109136881-3be0616acf4b"),
    alt: "Woman in an elegant royal-blue evening look",
    credit: "Unsplash",
  },
};
