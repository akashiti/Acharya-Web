import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import Programs from '@/components/Programs';
import WellnessRetreat from '@/components/WellnessRetreat';
import Testimonials from '@/components/Testimonials';
import Articles from '@/components/Articles';
import Gallery from '@/components/Gallery';
import ContactForm from '@/components/ContactForm';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Programs />
      <WellnessRetreat />
      <Testimonials />
      <Articles />
      <Gallery />
      <ContactForm />
    </>
  );
}
