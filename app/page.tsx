import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { MarketingLandingPage } from "@/components/marketing/landing-page";

export default function Home() {
  return (
    <div className="marketing-root">
      <Nav />
      <MarketingLandingPage />
      <Footer />
    </div>
  );
}
