import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Phone, Mail, Clock, Shield, Award, Star, Users, TrendingUp, Heart, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section con Imagen */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_cleaning_1767812896737.png"
            alt="Servicio de limpieza profesional"
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-sky-800/80 to-transparent mix-blend-multiply"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white text-lg px-6 py-2">
              ✨ #1 en Servicios de Limpieza
            </Badge>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Altiora<span className="text-secondary">Clean</span>
              <span className="block text-5xl md:text-6xl mt-2">Limpieza que Brilla</span>
            </h1>
            <p className="text-2xl mb-10 text-white/90 leading-relaxed max-w-2xl">
              Transformamos tu espacio con servicios de limpieza de clase mundial.
              Personal certificado, productos premium y resultados garantizados.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/agendar">
                <Button size="lg" className="text-2xl px-10 py-8 bg-secondary hover:bg-secondary/90 shadow-2xl animate-pulse-strong">
                  <Sparkles className="mr-3 h-8 w-8" />
                  Agendar Servicio Ahora
                </Button>
              </Link>
              <Link href="#servicios">
                <Button size="lg" variant="outline" className="text-xl px-12 py-8 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm">
                  Ver Servicios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white py-12 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Star, number: "30+", label: "Clientes Felices" },
              { icon: CheckCircle, number: "50+", label: "Servicios Completados" },
              { icon: Users, number: "10", label: "Profesionales" },
              { icon: TrendingUp, number: "98%", label: "Satisfacción" },
            ].map((stat, i) => (
              <div key={i} className="text-center transform hover:scale-110 transition-transform">
                <stat.icon className="h-10 w-10 mx-auto mb-3" />
                <div className="text-4xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios con Imágenes */}
      <section id="servicios" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-6 py-2">
              Nuestros Servicios
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Soluciones Perfectas para Ti
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos servicios personalizados con los más altos estándares de calidad
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                image: "/images/home_cleaning_1767812925154.png",
                title: "Limpieza Residencial",
                description: "Transforma tu hogar en un oasis de limpieza y confort",
                features: ["Pisos y superficies", "Cocina completa", "Baños impecables", "Habitaciones ordenadas"],
                price: "$100.000",
                color: "from-blue-500 to-blue-600",
              },
              {
                image: "/images/office_cleaning_1767812910857.png",
                title: "Limpieza Corporativa",
                description: "Mantén tu negocio brillando con profesionalismo",
                features: ["Oficinas y escritorios", "Áreas comunes", "Sanitización", "Mantenimiento regular"],
                price: "$120.000",
                color: "from-green-500 to-green-600",
              },
              {
                image: "/images/hero_cleaning_1767812896737.png",
                title: "Limpieza Profunda",
                description: "Deep cleaning exhaustivo para resultados extraordinarios",
                features: ["Limpieza detrás muebles", "Ventanas y marcos", "Electrodomésticos", "Desinfección total"],
                price: "$180.000",
                color: "from-purple-500 to-purple-600",
              },
            ].map((servicio, i) => (
              <Card key={i} className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/80 backdrop-blur-md hover:bg-white/90">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={servicio.image}
                    alt={servicio.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${servicio.color} opacity-0 group-hover:opacity-90 transition-opacity duration-500 flex items-center justify-center`}>
                    <Button size="lg" variant="secondary" className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-2xl">{servicio.title}</CardTitle>
                    <Badge className="bg-primary text-white text-lg px-4 py-1">{servicio.price}</Badge>
                  </div>
                  <p className="text-gray-600">{servicio.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {servicio.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/agendar">
                    <Button className="w-full" size="lg">
                      Agendar Este Servicio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestro Equipo */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/team_cleaning_1767812949229.png"
                alt="Nuestro equipo profesional"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20 px-6 py-2">
                Nuestro Equipo
              </Badge>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Profesionales Certificados y Apasionados
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Cada miembro de nuestro equipo está altamente capacitado, certificado
                y comprometido con la excelencia. Utilizamos las mejores técnicas y
                productos para garantizar resultados impecables.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { icon: Shield, title: "100% Confiable", desc: "Personal verificado" },
                  { icon: Award, title: "Certificado", desc: "Entrenamiento profesional" },
                  { icon: Heart, title: "Dedicado", desc: "Atención personalizada" },
                  { icon: Zap, title: "Eficiente", desc: "Resultados rápidos" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/agendar">
                <Button size="lg" className="text-lg px-8">
                  Conoce al Equipo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Antes y Después - Transformación */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-6 py-2">
              Resultados Comprobados
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="gradient-text">Transformación</span> Garantizada
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ve la diferencia que hace un servicio profesional
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl hover-lift">
              <Image
                src="/images/before_after_1767813358356.png"
                alt="Antes y después de nuestro servicio"
                width={1200}
                height={600}
                className="w-full h-auto"
              />
              <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl">
                Antes
              </div>
              <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl">
                Después
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { title: "100% Más Limpio", desc: "Eliminamos hasta la suciedad más difícil", icon: Sparkles },
                { title: "Ambientes Saludables", desc: "Desinfección profunda garantizada", icon: Shield },
                { title: "Resultados Duraderos", desc: "Limpieza que perdura en el tiempo", icon: Award },
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <Card key={i} className="text-center hover-lift">
                    <CardContent className="pt-8 pb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Productos y Equipos */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20 px-6 py-2">
                Equipamiento Premium
              </Badge>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Los Mejores <span className="gradient-text">Productos</span> del Mercado
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Utilizamos únicamente productos eco-friendly y equipos de última generación
                para garantizar resultados excepcionales mientras cuidamos el medio ambiente.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "✨ Productos biodegradables certificados",
                  "🌿 Libre de químicos agresivos",
                  "💪 Equipos profesionales de alta potencia",
                  "🛡️ Desinfectantes de grado hospitalario",
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-lg">
                    <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/agendar">
                <Button size="lg" className="text-lg px-10 shine-on-hover">
                  <Sparkles className="mr-2" />
                  Solicitar Información
                </Button>
              </Link>
            </div>
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl hover-lift">
              <Image
                src="/images/cleaning_supplies_1767813344083.png"
                alt="Productos de limpieza profesionales"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white border-primary/20 text-primary px-6 py-2">
              Testimonios
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Miles de clientes satisfechos confían en nosotros
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "María González",
                role: "Gerente General",
                text: "Increíble servicio. Mi oficina nunca había estado tan limpia. El equipo es profesional y puntual.",
                rating: 5,
              },
              {
                name: "Carlos Ramírez",
                role: "Propietario",
                text: "La limpieza profunda superó mis expectativas. Atención al detalle excepcional. 100% recomendado.",
                rating: 5,
              },
              {
                name: "Ana Martínez",
                role: "Dueña de Casa",
                text: "Servicio excelente y personal amable. Mi hogar brilla como nunca. Definitivamente volveré.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-white/40 backdrop-blur-xl border-white/50 border shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="pt-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, idx) => (
                      <Star key={idx} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Principal */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto relative overflow-hidden border-0">
            <div className="absolute inset-0">
              <Image
                src="/images/hero_cleaning_1767812896737.png"
                alt="Call to action"
                fill
                className="object-cover brightness-40"
              />
            </div>
            <CardContent className="relative z-10 p-16 text-center text-white">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                ¿Listo para un Espacio Impecable?
              </h2>
              <p className="text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
                Agenda tu servicio hoy y experimenta la diferencia de trabajar
                con verdaderos profesionales
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/agendar">
                  <Button size="lg" className="text-2xl px-10 py-8 bg-secondary hover:bg-secondary/90 shadow-2xl animate-pulse-strong">
                    <Sparkles className="mr-3 h-8 w-8" />
                    Agendar Ahora
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-xl px-12 py-8 border-2 border-white text-white hover:bg-white/20">
                    Acceso Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl">AltioraClean</h3>
                  <p className="text-sm text-gray-400">Tu socio de confianza</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Brindamos servicios de limpieza de clase mundial con un equipo dedicado
                a superar tus expectativas. Calidad garantizada en cada servicio.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <div className="space-y-3">
                <a href="tel:+573001234567" className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Phone className="h-5 w-5 text-primary group-hover:text-white" />
                  </div>
                  <span>+57 300 123 4567</span>
                </a>
                <a href="mailto:contacto@limpieza.com" className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center group-hover:bg-secondary transition-colors">
                    <Mail className="h-5 w-5 text-secondary group-hover:text-white" />
                  </div>
                  <span>contacto@altioraclean.com</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Horario</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Lunes a Sábado</span>
                </div>
                <div className="ml-8 text-white font-medium">7:00 AM - 7:00 PM</div>
                <div className="mt-4 text-sm">
                  Disponibilidad 24/7 para emergencias
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>© 2026 AltioraClean. Todos los derechos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
                <a href="/login" className="hover:text-white transition-colors">Admin</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
