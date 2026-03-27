import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata = {
  title: 'Acharya Aashish Ways | Spiritual Wellness & Growth',
  description:
    'Discover transformative spiritual programs, wellness retreats, and guided teachings by Acharya Aashish. Begin your journey towards inner peace and self-mastery.',
  keywords: [
    'Acharya Aashish',
    'spiritual wellness',
    'meditation',
    'wellness retreat',
    'inner peace',
    'self-mastery',
    'spiritual growth',
  ],
  openGraph: {
    title: 'Acharya Aashish Ways | Spiritual Wellness & Growth',
    description:
      'Discover transformative spiritual programs, wellness retreats, and guided teachings by Acharya Aashish.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-ivory text-plum antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

