
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Layout } from "lucide-react";

import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { CTASection } from "@/components/sections/CTASection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { TeamSection } from "@/components/sections/TeamSection";

interface ConfigPreviewProps {
    previewConfig: any;
    resolvedStyles?: { buttonCss?: string; badgeCss?: string; ctaBadgeCss?: string; catalogCardCss?: string };
}

export function ConfigPreview({ previewConfig, resolvedStyles }: ConfigPreviewProps) {
    return (
        <div className="sticky top-24">
            <Card className="overflow-hidden border-0 shadow-2xl bg-slate-900 ring-4 ring-slate-900/10 rounded-2xl">
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                        <Layout className="w-3 h-3" />
                        Live Preview
                    </div>
                </div>
                <div className="bg-white h-[calc(100vh-200px)] overflow-y-auto relative isolate">
                    {/* Component Render based on Tab */}
                    <TabsContent value="hero" className="mt-0 h-full">
                        <div className="transform scale-[0.8] origin-top h-full w-[125%]">
                            <HeroSection
                                key={`hero-${resolvedStyles?.buttonCss}-${resolvedStyles?.badgeCss}-${JSON.stringify(previewConfig?.branding_styles)}`}
                                previewConfig={previewConfig}
                                customStyles={resolvedStyles}
                            />
                        </div>
                    </TabsContent>

                    {/* SERVICIOS TAB - Catalog Preview */}
                    <TabsContent value="servicios" className="mt-0 h-full">
                        <div className="transform scale-[0.8] origin-top h-full w-[125%]">
                            <ServicesSection
                                key={`catalog-${resolvedStyles?.catalogCardCss}-${JSON.stringify(previewConfig?.branding_styles)}`}
                                previewConfig={previewConfig}
                                customStyles={{ catalogCardCss: resolvedStyles?.catalogCardCss }}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="stats" className="mt-0 h-full p-8 flex items-center justify-center bg-slate-50">
                        <div className="w-full max-w-4xl">
                            <StatsBar previewConfig={previewConfig} />
                        </div>
                    </TabsContent>

                    <TabsContent value="cta" className="mt-0 h-full">
                        <div className="transform scale-[0.8] origin-top h-full w-[125%]">
                            <CTASection
                                previewConfig={previewConfig}
                                customStyles={{
                                    ctaButtonPrimaryCss: (resolvedStyles as any)?.ctaButtonPrimaryCss,
                                    ctaButtonSecondaryCss: (resolvedStyles as any)?.ctaButtonSecondaryCss
                                }}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="equipo" className="mt-0 h-full overflow-y-auto">
                        <div className="transform scale-[0.6] origin-top w-[166%] h-full">
                            <TeamSection previewConfig={previewConfig} />
                        </div>
                    </TabsContent>

                    <TabsContent value="testimonios" className="mt-0 h-full overflow-y-auto">
                        <div className="transform scale-[0.6] origin-top w-[166%] h-full">
                            <TestimonialsSection previewConfig={previewConfig} />
                        </div>
                    </TabsContent>

                    <TabsContent value="branding" className="mt-0 h-full overflow-y-auto">
                        <div className="transform scale-[0.6] origin-top w-[166%] h-full">
                            {/* Show a composite page for branding */}
                            <HeroSection previewConfig={previewConfig} customStyles={resolvedStyles} />
                            <StatsBar previewConfig={previewConfig} />
                            <CTASection previewConfig={previewConfig} />
                        </div>
                    </TabsContent>
                </div>
            </Card>
        </div>
    );
}
