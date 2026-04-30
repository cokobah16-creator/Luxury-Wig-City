export interface Wig {
  id: string
  name: string
  price: number
  oldPrice?: number
  category: 'Bone Straight' | 'Pixie Curls' | 'Frontal Wigs' | 'Closure Wigs' | 'Braided Wigs'
  texture: 'Straight' | 'Wavy' | 'Curly' | 'Kinky'
  length: number    // inches
  density: number   // %
  laceType: '13x4 HD Lace' | '13x6 HD Lace' | '5x5 Closure' | '4x4 Closure' | 'Full Lace' | 'No Lace'
  color: 'Natural Black' | 'Honey Blonde' | 'Burgundy' | 'Custom'
  hairType: 'Human Hair' | 'Synthetic Blend'
  badge?: 'Bestseller' | 'New' | 'Limited' | 'Editor\'s Pick'
  description: string
  vendor: string
  rating: number
  reviews: number
}

export const wigs: Wig[] = [
  {
    id: 'abuja-silk',
    name: 'Abuja Silk',
    price: 285000,
    oldPrice: 315000,
    category: 'Bone Straight',
    texture: 'Straight',
    length: 26,
    density: 200,
    laceType: '13x6 HD Lace',
    color: 'Natural Black',
    hairType: 'Human Hair',
    badge: 'Bestseller',
    description: 'Ultra-glossy bone straight, hand-tied 13x6 HD frontal. Pre-plucked hairline, baby hairs styled. Built for the woman who walks into a room and owns it.',
    vendor: 'Adaeze Hair Co.',
    rating: 4.9,
    reviews: 412
  },
  {
    id: 'lagos-bone-straight',
    name: 'Lagos Bone Straight',
    price: 215000,
    category: 'Bone Straight',
    texture: 'Straight',
    length: 22,
    density: 180,
    laceType: '13x4 HD Lace',
    color: 'Natural Black',
    hairType: 'Human Hair',
    badge: 'Bestseller',
    description: 'Signature bone straight with mirror-shine finish. The everyday luxury that takes you from boardroom to dinner.',
    vendor: 'Chiamaka Hair',
    rating: 4.8,
    reviews: 289
  },
  {
    id: 'wuse-curls',
    name: 'Wuse Pixie Curls',
    price: 165000,
    category: 'Pixie Curls',
    texture: 'Curly',
    length: 14,
    density: 180,
    laceType: '5x5 Closure',
    color: 'Natural Black',
    hairType: 'Human Hair',
    badge: 'New',
    description: 'Bouncy pixie curls with all-day hold. Glueless wear-and-go construction — secure in 30 seconds.',
    vendor: 'Folake Beauty',
    rating: 4.9,
    reviews: 156
  },
  {
    id: 'bohemian-dream',
    name: 'Bohemian Dream',
    price: 245000,
    category: 'Frontal Wigs',
    texture: 'Curly',
    length: 24,
    density: 200,
    laceType: '13x6 HD Lace',
    color: 'Natural Black',
    hairType: 'Human Hair',
    badge: 'Editor\'s Pick',
    description: 'Cascading bohemian curls. The wedding-season favourite. Custom lace tinted to your skin tone.',
    vendor: 'Adaeze Hair Co.',
    rating: 5.0,
    reviews: 203
  },
  {
    id: 'asaba-honey',
    name: 'Asaba Honey',
    price: 195000,
    category: 'Closure Wigs',
    texture: 'Wavy',
    length: 20,
    density: 180,
    laceType: '5x5 Closure',
    color: 'Honey Blonde',
    hairType: 'Human Hair',
    description: 'Sun-kissed honey blonde body wave. Hand-painted highlights. Made to turn heads in Lagos golden hour.',
    vendor: 'Nneka Wigs Ltd.',
    rating: 4.7,
    reviews: 98
  },
  {
    id: 'royal-burgundy',
    name: 'Royal Burgundy',
    price: 275000,
    category: 'Frontal Wigs',
    texture: 'Straight',
    length: 24,
    density: 200,
    laceType: '13x4 HD Lace',
    color: 'Burgundy',
    hairType: 'Human Hair',
    badge: 'Limited',
    description: 'Custom-coloured burgundy. Limited monthly drop. Numbered, signed, and certified by our master colorist.',
    vendor: 'Chiamaka Hair',
    rating: 4.9,
    reviews: 67
  },
  {
    id: 'queen-braids',
    name: 'Queen Braids',
    price: 145000,
    category: 'Braided Wigs',
    texture: 'Kinky',
    length: 28,
    density: 150,
    laceType: 'Full Lace',
    color: 'Natural Black',
    hairType: 'Synthetic Blend',
    description: 'Box-braided full lace wig. Pre-installed, glueless, and lasts 6+ weeks of consistent wear.',
    vendor: 'Folake Beauty',
    rating: 4.6,
    reviews: 134
  },
  {
    id: 'nile-waves',
    name: 'Nile Waves',
    price: 225000,
    category: 'Frontal Wigs',
    texture: 'Wavy',
    length: 26,
    density: 200,
    laceType: '13x6 HD Lace',
    color: 'Natural Black',
    hairType: 'Human Hair',
    description: 'Soft Egyptian-inspired body wave. Hand-tied frontal. Bridal-grade luxury.',
    vendor: 'Adaeze Hair Co.',
    rating: 4.9,
    reviews: 178
  }
]

export const formatNaira = (n: number) =>
  '₦' + n.toLocaleString('en-NG')
