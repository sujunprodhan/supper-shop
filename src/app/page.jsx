import HeroBanner from "@/components/HeroBanner";
import CategoryCards from "@/components/CategoryCards";
import Product from "@/components/Product";
import DealOfTheDay from "@/components/DealOfTheDay";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import AppDownloadBanner from "@/components/AppDownloadBanner";

export default function Home() {
  return (
    <div className="space-y-0">
      {/* 1. Hero Showcase */}
      <HeroBanner />

      {/* 2. Category Cards */}
      <CategoryCards />

      {/* 3. Featured Products with 8 items pagination */}
      <Product />

      {/* 4. Deal of the Day with Live Countdown Timer */}
      <DealOfTheDay />

      {/* 5. Why Choose Us (Value Propositions) */}
      <WhyChooseUs />

      {/* 6. Customer Testimonials & Reviews */}
      <Testimonials />

      {/* 7. Mobile App Promo Banner */}
      <AppDownloadBanner />
    </div>
  );
}
