/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, GalleryItem, BlogPost, BeforeAfterItem } from './types';

export const SERVICES: Service[] = [
  // Makeup
  {
    id: 'makeup-1',
    name: 'Royal Bridal HD Makeup',
    category: 'Makeup',
    price: 15000,
    duration: '180 mins',
    description: 'Ultra high-definition flawless bridal makeup with luxury lashes, airbrush touch, and professional drapery preset.'
  },
  {
    id: 'makeup-2',
    name: 'Celebrity Red Carpet Makeup',
    category: 'Makeup',
    price: 8000,
    duration: '120 mins',
    description: 'Stunning premium spotlight makeup with flawless contouring and premium lash configuration.'
  },
  {
    id: 'makeup-3',
    name: 'Luxury Sangeet / Reception Glitz',
    category: 'Makeup',
    price: 6500,
    duration: '90 mins',
    description: 'Perfect cocktail party glam showcasing glowing skin, metallic custom eyeshadow palettes, and elegant drapery.'
  },
  
  // Hair
  {
    id: 'hair-1',
    name: 'Keratin Diamond Smooth Therapy',
    category: 'Hair',
    price: 7500,
    duration: '150 mins',
    description: 'Signature hair smoothing treatment that restores proteins, eliminates frizz, and adds premium glossy shine.'
  },
  {
    id: 'hair-2',
    name: 'Precision Couture Cut & Blowdry',
    category: 'Hair',
    price: 2500,
    duration: '60 mins',
    description: 'Advanced custom hair styling mapping your face structure, topped with a volcanic styling serum and signature blow dry.'
  },
  {
    id: 'hair-3',
    name: 'Gold Balayage Coloring & Bond-Repair',
    category: 'Hair',
    price: 9000,
    duration: '180 mins',
    description: 'Hand-painted premium luxury hair strokes with deep Olaplex bonding treatment for absolute strand safety.'
  },

  // Skin Care
  {
    id: 'skin-1',
    name: 'Golden Glow Cellular Facial',
    category: 'Skin',
    price: 4500,
    duration: '75 mins',
    description: 'Premium 24K gold foil infusion facial featuring ultrasonic firming, pore cleansing, and essential peptide mask.'
  },
  {
    id: 'skin-2',
    name: 'Hydra-Infusion Dermabrasion',
    category: 'Skin',
    price: 5500,
    duration: '90 mins',
    description: 'Multi-stage deep dynamic mechanical exfoliation synced with customized nutrient serums for plump skin.'
  },

  // Nails
  {
    id: 'nails-1',
    name: 'Glamour Gel Extension (Full Set)',
    category: 'Nails',
    price: 3500,
    duration: '90 mins',
    description: 'Full luxury extensions embellished with fine glitter chrome, customized decals, and high-gloss topcoat sealing.'
  },

  // Men's Grooming
  {
    id: 'men-1',
    name: 'Executive Grooming Package',
    category: 'Mens',
    price: 2500,
    duration: '75 mins',
    description: 'Precision shear cut, deep menthol wash, sandalwood oil hot-towel beard shave, and revitalizing charcoal facial rub.'
  },

  // Bridal Packages
  {
    id: 'bridal-1',
    name: 'The Royal South Indian Bride Package',
    category: 'Bridal',
    price: 18000,
    duration: '240 mins',
    description: 'Traditional Silk Saree Draping with perfect pin geometry, HD/Dewy moisture-proof makeup, classic hairstyle with fresh Jasmine flower wrapping, jewelry alignment, and pre-wedding makeup trial.'
  },
  {
    id: 'bridal-2',
    name: 'The Velvet Rajkumari Elegance Package',
    category: 'Bridal',
    price: 22000,
    duration: '240 mins',
    description: 'Premium Airbrush long-lasting velvet skin finish, heavy Lehenga draping with double-dupatta pin, romantic messy bun structure, rich smokey eyeshadow, and complimentary cellular gold facial.'
  },
  {
    id: 'bridal-3',
    name: 'The Modern Indo-Western Glow Package',
    category: 'Bridal',
    price: 15000,
    duration: '180 mins',
    description: 'Semi-matte lightweight glass skin dermo-foundation, open-wave styling, designer gown/saree alignment, and metallic touch highlights.'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
    category: 'bridal',
    title: 'The Golden Heritage Bride',
    description: 'Meticulous traditional bridal make-up paired with premium heavy gold jewelry coordination and classical red drapery.'
  },
  {
    id: 'gal-2',
    url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    category: 'hair',
    title: 'Warm Balayage Masterpiece',
    description: 'Seamless hand-painted honey-caramel highlights styled with premium bouncy layered waves.'
  },
  {
    id: 'gal-3',
    url: 'https://images.unsplash.com/photo-1604654894610-df4906b1850a?auto=format&fit=crop&q=80&w=800',
    category: 'nails',
    title: 'Emerald Gold Nails',
    description: 'Sleek custom gel extensions showing deep emerald base coats mixed with hand-applied gold leaf patterns.'
  },
  {
    id: 'gal-4',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
    category: 'makeup',
    title: 'Dewy Twilight Editorial Look',
    description: 'Minimalist glass-skin glow featuring delicate highlight accents and deep berry satin lipstick work.'
  },
  {
    id: 'gal-5',
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    category: 'hair',
    title: 'Precision Bridal Braids',
    description: 'Lavish traditional South Indian braid setup wrapped with fresh jasmine garlands and authentic temple gold accessories.'
  },
  {
    id: 'gal-6',
    url: 'https://images.unsplash.com/photo-1622287198514-72de0b555938?auto=format&fit=crop&q=80&w=800',
    category: 'mens',
    title: 'Royal Sandalwood Beard Sculpting',
    description: 'Crisp razor line detailing and luxury beard therapy for a polished, textured finish.'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: '5 Golden Rules for Flawless Bridal Skin Preparation',
    category: 'Bridal Skin Care',
    date: 'June 18, 2026',
    excerpt: 'Dermatologist-approved prep tactics to accomplish a beautiful, authentic glow from within before your wedding vows.',
    content: `Achieving that flawless, lit-from-within bridal glow isn't a result of a database of highlighters on the big day—it is a continuous skincare ceremony starting months in advance. 

    Here are the core rules curated by Body and Beauty Studio’s Lead Aesthetician Shubha:
    
    1. HYDRATION MONOPOLY
    The skin's volume is directly dependent on deep cell hydration. Drink at least 3 liters of customized structured water daily, and incorporate double-hyaluronic acid serums in your night sequence.
    
    2. CEASE EXPERIMENTATION 30 DAYS OUT
    Never introduce new active chemical peels, retinoids, or unvetted facials closer than four weeks to your ceremony. Your skin needs a minimum of 28 days to recover from cellular flare-ups.
    
    3. DETOXIFY FROM WITHIN
    Include green matching antioxidant infusions and reduce refined sugars which cause immediate inflammation and breakdown collagen chains in your skin.
    
    4. GENTLE MICRO-EXFOLIATION
    Swap harsh facial scrubs for poly-hydroxy acids (PHAs) that dissolve dead cells gently without creating micro-tears in the delicate skin barrier.
    
    5. THE ROYAL MASSAGE RITUAL
    Undergo face gymnastics or manual lymphatic drainage (available at our Yelahanka Satellite Town salon) to oxygenate tissue and immediately drop water weight and swelling around your cheekbones.`,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'blog-2',
    title: 'Keratin vs Hair Botox: Selecting Your Signature Therapy',
    category: 'Hair Science',
    date: 'May 20, 2026',
    excerpt: 'Demystifying the technical differences so your luxury hair receives exactly what its texture demands.',
    content: `Many clients visit our counters asking for smoothing but ending up confused between these two highly popular professional treatments. Let’s dissect the active chemical and structural differences so you can consult with your therapist effectively.

    What is Keratin Therapy?
    Keratin smooths out frizz by sealing hair strands with dynamic protein layers and heat-activated straightening compounds. It is optimal for clients seeking a significant decrease in volume, relaxed curl structures, and super-sleek hair.
    
    What is Hair Botox?
    Unlike standard skin Botox, hair botox is a deep-conditioning thermal treatment reconstructive service. It does not chemically break disulfide bounds in hair waves. Instead, it operates like a super-enriching filler, infusing damaged cuticles with organic vitamins, premium oils, collagen, and caviar extracts.
    
    Which one is for you?
    - Choose Keratin if you have coarse, thick, unmanageable strands and seek a straighter look.
    - Choose Hair Botox if your strands are fine, highly damaged from blonde bleaching, split at the ends, and you seek to retain your natural curl volume with incredible rejuvenation and repair.`,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
  }
];

// export const BEFORE_AFTER_ITEMS: BeforeAfterItem[] = [
//   {
//     id: 'ba-1',
//     before_url: 'https://images.unsplash.com/photo-1617331721458-bf3a30070bc0?auto=format&fit=crop&q=80&w=500',
//     after_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=500',
//     title: 'Keratin Smoothing Transformation',
//     description: 'Bespoke high-gloss protein reconstruction on frizzy, dry hair. Transformed to perfectly structured honey-blonde waves.',
//     created_at: '2026-06-20T10:00:00.000Z'
//   },
//   {
//     id: 'ba-2',
//     before_url: 'https://images.unsplash.com/photo-1600607687930-c11fa6771d9d?auto=format&fit=crop&q=80&w=500',
//     after_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=500',
//     title: 'Bridal Skin HD Hydration Glow',
//     description: 'Hydra-infusion mechanical exfoliation followed by 24K gold foil cellular therapy, creating a smooth and plump skin canvas.',
//     created_at: '2026-06-21T11:30:00.000Z'
//   },
//   {
//     id: 'ba-3',
//     before_url: 'https://images.unsplash.com/photo-1604654784400-0f2a7dbdfcb7?auto=format&fit=crop&q=80&w=500',
//     after_url: 'https://images.unsplash.com/photo-1604654894610-df4906b1850a?auto=format&fit=crop&q=80&w=500',
//     title: 'Gel Extension & Emerald Chrome Art',
//     description: 'Full set custom gel extensions styled with emerald green lacquer, real gold foil leaves, and high-gloss protective sealing.',
//     created_at: '2026-06-22T14:15:00.000Z'
//   }
// ];

