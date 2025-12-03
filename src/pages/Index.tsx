import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import TemplatesSection from "@/components/TemplatesSection";
import WebsiteGenerator from "@/components/WebsiteGenerator";
import PricingSection from "@/components/PricingSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TemplatesSection />
        <WebsiteGenerator />
        <PricingSection />
        <TargetAudienceSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
