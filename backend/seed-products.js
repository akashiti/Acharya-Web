/**
 * seed-products.js
 * Populates the database with categories and sample products.
 * Run from the backend directory:
 *   node seed-products.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Crystals & Stones', slug: 'crystals-stones', description: 'Healing crystals and sacred stones for spiritual growth', sortOrder: 1 },
  { name: 'Meditation Tools', slug: 'meditation-tools', description: 'Tools and accessories to deepen your meditation practice', sortOrder: 2 },
  { name: 'Sacred Books', slug: 'sacred-books', description: 'Spiritual texts, journals, and wisdom literature', sortOrder: 3 },
  { name: 'Aromatherapy', slug: 'aromatherapy', description: 'Essential oils, incense, and aromatic wellness products', sortOrder: 4 },
  { name: 'Malas & Jewelry', slug: 'malas-jewelry', description: 'Sacred malas, rudraksha beads, and spiritual jewelry', sortOrder: 5 },
];

async function seedCategories() {
  console.log('\n🌱  Seeding categories...');
  const created = {};
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      console.log(`   ↩️  Already exists: ${cat.name}`);
      created[cat.slug] = existing.id;
    } else {
      const c = await prisma.category.create({ data: cat });
      console.log(`   ✅  Created: ${cat.name}`);
      created[cat.slug] = c.id;
    }
  }
  return created;
}

async function seedProducts(catIds) {
  console.log('\n🌱  Seeding products...');

  const products = [
    // Crystals
    {
      title: 'Rose Quartz Crystal',
      slug: 'rose-quartz-crystal',
      description: 'The stone of unconditional love. Rose Quartz opens the heart chakra and promotes deep inner healing, self-love, and compassion. A perfect companion for emotional healing and attracting harmonious relationships.',
      price: 499,
      salePrice: 399,
      stock: 50,
      categoryId: catIds['crystals-stones'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500']),
    },
    {
      title: 'Amethyst Cluster',
      slug: 'amethyst-cluster',
      description: 'A powerful and protective stone that guards against negative energy. Amethyst activates spiritual awareness, opens intuition, and enhances psychic abilities. Ideal for meditation and stress relief.',
      price: 799,
      salePrice: null,
      stock: 30,
      categoryId: catIds['crystals-stones'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500']),
    },
    {
      title: 'Black Tourmaline',
      slug: 'black-tourmaline',
      description: 'A highly protective stone that repels and blocks negative energies. Black Tourmaline creates a protective shield around the body and provides a grounding energy that connects you to the Earth.',
      price: 349,
      salePrice: null,
      stock: 60,
      categoryId: catIds['crystals-stones'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500']),
    },
    // Meditation Tools
    {
      title: 'Tibetan Singing Bowl',
      slug: 'tibetan-singing-bowl',
      description: 'Hand-hammered in Nepal, this authentic Tibetan singing bowl produces rich, deep tones that promote relaxation, mindfulness, and healing. Comes with a cushion and playing mallet.',
      price: 1499,
      salePrice: 1299,
      stock: 20,
      categoryId: catIds['meditation-tools'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=500']),
    },
    {
      title: 'Meditation Cushion (Zafu)',
      slug: 'meditation-cushion-zafu',
      description: 'A traditional round meditation cushion filled with natural buckwheat hulls. Provides optimal support for extended meditation sessions by elevating the hips and aligning the spine.',
      price: 899,
      salePrice: null,
      stock: 35,
      categoryId: catIds['meditation-tools'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500']),
    },
    {
      title: 'Prayer Wheel (Brass)',
      slug: 'prayer-wheel-brass',
      description: 'Handcrafted brass prayer wheel containing sacred mantras. Spinning the prayer wheel is said to have the same positive effect as reciting prayers aloud. A beautiful addition to any sacred space.',
      price: 649,
      salePrice: null,
      stock: 25,
      categoryId: catIds['meditation-tools'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1518979520244-8401ac3fc3ef?w=500']),
    },
    // Sacred Books
    {
      title: 'Spiritual Journal — Self-Mastery Edition',
      slug: 'spiritual-journal-self-mastery',
      description: 'A beautifully designed 200-page guided journal for your inner journey. Features daily reflection prompts, gratitude pages, moon cycle tracking, and space for intentions. Premium hardcover with gilt edges.',
      price: 599,
      salePrice: 499,
      stock: 100,
      categoryId: catIds['sacred-books'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=500']),
    },
    {
      title: 'Acharya Aashish — Path to Inner Peace',
      slug: 'path-to-inner-peace-book',
      description: 'A transformative guide by Acharya Aashish that distills decades of wisdom into practical, accessible teachings. Learn ancient techniques adapted for modern life to achieve lasting inner peace and clarity.',
      price: 449,
      salePrice: null,
      stock: 80,
      categoryId: catIds['sacred-books'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500']),
    },
    // Aromatherapy
    {
      title: 'Sandalwood Essential Oil (10ml)',
      slug: 'sandalwood-essential-oil',
      description: 'Pure, therapeutic-grade sandalwood essential oil sourced from sustainable farms. Promotes deep relaxation, mental clarity, and spiritual awareness. Ideal for meditation, diffusing, and skincare.',
      price: 699,
      salePrice: null,
      stock: 75,
      categoryId: catIds['aromatherapy'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500']),
    },
    {
      title: 'Palo Santo Bundle (5 sticks)',
      slug: 'palo-santo-bundle',
      description: 'Sustainably harvested Palo Santo from South America. Known as "Holy Wood," Palo Santo is used for cleansing, healing, and attracting positive energy. Each bundle contains 5 premium-quality sticks.',
      price: 299,
      salePrice: 249,
      stock: 120,
      categoryId: catIds['aromatherapy'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500']),
    },
    {
      title: 'Sacred Incense Set (12 varieties)',
      slug: 'sacred-incense-set',
      description: 'A curated collection of 12 premium hand-rolled incense sticks including frankincense, myrrh, nag champa, lotus, and more. Each variety is carefully selected for purity and long-lasting fragrance.',
      price: 449,
      salePrice: 399,
      stock: 60,
      categoryId: catIds['aromatherapy'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=500']),
    },
    // Malas & Jewelry
    {
      title: 'Rudraksha Mala (108 beads)',
      slug: 'rudraksha-mala-108',
      description: 'Authentic 108-bead Rudraksha mala hand-knotted with silk thread. Rudraksha beads are sacred seeds believed to carry the blessings of Lord Shiva. Used for japa meditation and as a powerful spiritual accessory.',
      price: 999,
      salePrice: null,
      stock: 40,
      categoryId: catIds['malas-jewelry'],
      featured: true,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1589998059171-988d887df646?w=500']),
    },
    {
      title: 'Lapis Lazuli Mala',
      slug: 'lapis-lazuli-mala',
      description: 'A stunning 108-bead mala crafted from genuine lapis lazuli, the stone of wisdom and truth. Each bead is hand-polished to reveal its deep blue color and golden pyrite flecks. Includes gold-plated guru bead.',
      price: 1299,
      salePrice: 1099,
      stock: 20,
      categoryId: catIds['malas-jewelry'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1600607686527-6fb886090705?w=500']),
    },
    {
      title: 'Om Symbol Pendant (Sterling Silver)',
      slug: 'om-symbol-pendant-silver',
      description: 'A beautifully crafted 925 sterling silver Om pendant on an 18-inch chain. The Om symbol represents the universal sound of the cosmos and is considered the most sacred mantra. Comes in a gift box.',
      price: 849,
      salePrice: null,
      stock: 55,
      categoryId: catIds['malas-jewelry'],
      featured: false,
      published: true,
      images: JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500']),
    },
  ];

  let count = 0;
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`   ↩️  Already exists: ${p.title}`);
    } else {
      await prisma.product.create({ data: p });
      console.log(`   ✅  Created: ${p.title} — ₹${p.price}`);
      count++;
    }
  }
  return count;
}

async function main() {
  console.log('✨  Acharya Ways — Product Seeder');
  console.log('══════════════════════════════════\n');
  const catIds = await seedCategories();
  const count = await seedProducts(catIds);
  console.log(`\n🎉  Done! ${count} products seeded across ${Object.keys(catIds).length} categories.`);
  console.log('   Open http://localhost:3000/shop to see them live.\n');
}

main()
  .catch((e) => { console.error('❌  Error:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
