

import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";
import { TeamSection } from "@/components/sections/TeamSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { obtenerConfiguracion } from "@/lib/actions/configuracion";
import { obtenerEstilos } from "@/lib/actions/estilos";
import { obtenerMiembrosEquipo } from "@/lib/actions/equipo";
import { obtenerTestimonios } from "@/lib/actions/testimonios";

export default async function HomePage() {
  // Fetch data in parallel
  const [config, stylesData, teamResult, testimonialsResult] = await Promise.all([
    obtenerConfiguracion(),
    obtenerEstilos(),
    obtenerMiembrosEquipo(),
    obtenerTestimonios()
  ]);

  // Resolve Dynamic Styles
  let customStyles: any = {};
  if (config && config.branding_styles && stylesData.success && stylesData.data) {
    try {
      const savedIds = JSON.parse(config.branding_styles);
      const allStyles = stylesData.data;

      customStyles = {
        buttonCss: allStyles.find((s: any) => (s.$id === savedIds.buttonStyle || s.id === savedIds.buttonStyle))?.css_classes,
        badgeCss: allStyles.find((s: any) => (s.$id === savedIds.heroBadgeStyle || s.id === savedIds.heroBadgeStyle))?.css_classes,
        ctaBadgeCss: allStyles.find((s: any) => (s.$id === savedIds.ctaBadgeStyle || s.id === savedIds.ctaBadgeStyle))?.css_classes,
        catalogCardCss: allStyles.find((s: any) => (s.$id === savedIds.catalogCardStyle || s.id === savedIds.catalogCardStyle))?.css_classes,
        ctaButtonPrimaryCss: allStyles.find((s: any) => (s.$id === savedIds.ctaFinalButtonPrimary || s.id === savedIds.ctaFinalButtonPrimary))?.css_classes,
        ctaButtonSecondaryCss: allStyles.find((s: any) => (s.$id === savedIds.ctaFinalButtonSecondary || s.id === savedIds.ctaFinalButtonSecondary))?.css_classes,
      };
    } catch (e) {
      console.error("Error resolving home styles", e);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      <HeroSection customStyles={customStyles} />
      <ServicesSection customStyles={{ catalogCardCss: customStyles.catalogCardCss }} />
      <StatsBar />
      <TeamSection previewConfig={{ team_members: JSON.stringify(teamResult.success ? teamResult.data : []) } as any} />
      <TestimonialsSection previewConfig={{ testimonials: JSON.stringify(testimonialsResult.success ? testimonialsResult.data : []) } as any} />
      <CTASection customStyles={{
        ctaButtonPrimaryCss: customStyles.ctaButtonPrimaryCss,
        ctaButtonSecondaryCss: customStyles.ctaButtonSecondaryCss
      }} />
      <Footer />
    </div>
  );
}
