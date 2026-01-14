"use client";

import { useCompany } from "@/context/CompanyContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
    const { config } = useCompany();
    const companyName = config?.nombre || 'AltioraClean';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/registrarse">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al Registro
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">
                        Términos y Condiciones
                    </h1>
                    <p className="text-slate-600">
                        Última actualización: Enero 2026
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border-2 border-slate-100">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Aceptación de Términos</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Al registrarte y utilizar los servicios de <span className="font-semibold">{companyName}</span>,
                            aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte
                            de estos términos, no debes utilizar nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Servicios Ofrecidos</h2>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            {companyName} ofrece servicios de limpieza y mantenimiento para espacios residenciales y comerciales,
                            así como la venta de productos de limpieza a través de nuestro catálogo online.
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li>Servicios de limpieza por cita previa</li>
                            <li>Venta de productos de limpieza</li>
                            <li>Pedidos online con entrega a domicilio</li>
                            <li>Programa de puntos y fidelidad</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Registro de Cuenta</h2>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            Para acceder a ciertos servicios, debes crear una cuenta proporcionando información precisa y completa:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
                            <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
                            <li>La información proporcionada debe ser veraz y actualizada</li>
                            <li>Solo puedes tener una cuenta por persona</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Pedidos y Pagos</h2>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            Al realizar un pedido:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li>Los precios están sujetos a cambios sin previo aviso</li>
                            <li>Nos reservamos el derecho de rechazar o cancelar pedidos</li>
                            <li>El pago puede realizarse mediante los métodos especificados en cada transacción</li>
                            <li>Los pedidos se confirman por WhatsApp y quedan registrados en tu cuenta</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Servicios de Limpieza</h2>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            Para los servicios de limpieza:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li>Las citas deben agendarse con al menos 24 horas de anticipación</li>
                            <li>Las cancelaciones con menos de 12 horas pueden generar cargos</li>
                            <li>Debes proporcionar acceso adecuado al área a limpiar</li>
                            <li>El tiempo estimado puede variar según las condiciones del espacio</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Descuentos y Promociones</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Los nuevos clientes registrados reciben un <span className="font-semibold text-emerald-600">4% de descuento</span> en
                            su primer servicio. Las promociones:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mt-3">
                            <li>Son válidas por tiempo limitado salvo se indique lo contrario</li>
                            <li>No son acumulables con otras promociones</li>
                            <li>Pueden tener restricciones específicas</li>
                            <li>Están sujetas a disponibilidad</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Privacidad de Datos</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Recopilamos y procesamos información personal de acuerdo con nuestra Política de Privacidad.
                            Tu información se utiliza únicamente para:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mt-3">
                            <li>Procesar pedidos y servicios</li>
                            <li>Comunicarnos contigo sobre tu cuenta</li>
                            <li>Mejorar nuestros servicios</li>
                            <li>Enviar información relevante (con tu consentimiento)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Responsabilidades</h2>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            {companyName} no se hace responsable por:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                            <li>Daños a objetos de valor no declarados previamente</li>
                            <li>Retrasos causados por circunstancias fuera de nuestro control</li>
                            <li>Productos dañados durante el envío por el transportista</li>
                            <li>Uso inadecuado de los productos adquiridos</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">9. Garantía de Satisfacción</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Si no estás satisfecho con nuestro servicio, contáctanos dentro de las 24 horas siguientes
                            a su realización. Evaluaremos cada caso y buscaremos una solución adecuada.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">10. Modificaciones</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones
                            entrarán en vigor inmediatamente después de su publicación en la plataforma. Es tu responsabilidad
                            revisar periódicamente estos términos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">11. Contacto</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Para preguntas sobre estos términos, puedes contactarnos:
                        </p>
                        <div className="mt-3 p-4 bg-slate-50 rounded-lg">
                            <p className="text-slate-700">
                                <span className="font-semibold">Email:</span> {config?.email || 'contacto@altioraclean.com'}
                            </p>
                            <p className="text-slate-700">
                                <span className="font-semibold">Teléfono:</span> {config?.telefono || '+57 322 323 8781'}
                            </p>
                        </div>
                    </section>

                    <div className="pt-6 border-t-2 border-slate-200">
                        <p className="text-sm text-slate-500 italic">
                            Al hacer clic en "Registrarse" en el formulario de registro, confirmas que has leído,
                            entendido y aceptado estos Términos y Condiciones.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/registrarse">
                        <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                            Volver al Registro
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" size="lg">
                            Ir al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
