import Image from "next/image"
import { Phone, MapPin, Clock, Syringe, Stethoscope, Scissors, Bath, Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Syringe,
    title: "Vacunas",
    description: "Programa completo de vacunacion para proteger a tu mascota",
  },
  {
    icon: Stethoscope,
    title: "Consultas",
    description: "Atencion medica profesional y diagnostico preciso",
  },
  {
    icon: Heart,
    title: "Desparasitaciones",
    description: "Control y prevencion de parasitos internos y externos",
  },
  {
    icon: Scissors,
    title: "Cirugias",
    description: "Procedimientos quirurgicos con equipos modernos",
  },
  {
    icon: Bath,
    title: "Baños Medicados",
    description: "Tratamientos dermatologicos especializados",
  },
]

export default function ClienteLandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-drago.jpg"
              alt="Veterinaria Drago"
              width={48}
              height={48}
              className="rounded-lg shadow-md"
            />
            <span className="text-xl font-bold text-slate-800">Veterinaria Drago</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#servicios" className="text-slate-700 hover:text-sky-600 font-medium transition-colors">
              Servicios
            </a>
            <a href="#nosotros" className="text-slate-700 hover:text-sky-600 font-medium transition-colors">
              Nosotros
            </a>
            <a href="#contacto" className="text-slate-700 hover:text-sky-600 font-medium transition-colors">
              Contacto
            </a>
          </nav>
          <a
            href="https://wa.me/51935841065"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">935 841 065</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 z-10">
              <h1 className="text-4xl md:text-6xl font-bold text-sky-950 leading-tight drop-shadow-sm">
                Te<br />cuido
              </h1>
              <p className="text-xl text-sky-900 font-medium">
                Veterinario a domicilio y en consultorio
              </p>
              <p className="text-lg text-sky-800">
                Dedicados al cuidado de tu mascota
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="https://wa.me/51935841065?text=Hola,%20quiero%20agendar%20una%20cita%20para%20mi%20mascota" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 shadow-lg">
                    Agendar cita
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#servicios">
                  <Button size="lg" variant="outline" className="border-sky-600 text-sky-900 hover:bg-sky-100 shadow-md">
                    Ver servicios
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-white/80 shadow-2xl flex items-center justify-center p-4 border-4 border-sky-200">
                <Image
                  src="/logo-drago.jpg"
                  alt="Veterinaria Drago"
                  width={280}
                  height={280}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Ofrecemos atencion veterinaria integral para el bienestar de tu mascota
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-6 rounded-2xl border-2 border-sky-100 bg-white shadow-md hover:shadow-xl hover:border-sky-300 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-4 group-hover:bg-sky-200 transition-colors">
                  <service.icon className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-sky-950">
                Dr. Carlos Liberato Tucto
              </h2>
              <p className="text-xl text-sky-700 font-semibold">
                Medico Veterinario - C.M.V.P. N 6574
              </p>
              <p className="text-sky-900 leading-relaxed max-w-2xl mx-auto text-lg">
                Con años de experiencia en medicina veterinaria, el Dr. Carlos Liberato
                brinda atencion profesional y dedicada para el cuidado de tu mascota.
                Especializado en medicina preventiva, cirugia y tratamientos integrales.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sky-900 font-medium">
                  <div className="w-3 h-3 rounded-full bg-sky-600" />
                  Atencion personalizada
                </div>
                <div className="flex items-center gap-2 text-sky-900 font-medium">
                  <div className="w-3 h-3 rounded-full bg-sky-600" />
                  Visitas a domicilio
                </div>
                <div className="flex items-center gap-2 text-sky-900 font-medium">
                  <div className="w-3 h-3 rounded-full bg-sky-600" />
                  Equipos modernos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Contactanos
              </h2>
              <p className="text-slate-600 text-lg">
                Estamos para ayudarte con el cuidado de tu mascota
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-md">
                <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1 text-lg">Telefono</h3>
                <a href="tel:+51935841065" className="text-sky-600 hover:underline font-semibold text-lg">
                  935 841 065
                </a>
              </div>
              <div className="text-center p-6 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-md">
                <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1 text-lg">Horario</h3>
                <p className="text-slate-600 font-medium">Lun - Sab: 9am - 7pm</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-md">
                <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1 text-lg">Ubicacion</h3>
                <p className="text-slate-600 font-medium">Atencion a domicilio</p>
              </div>
            </div>
            <div className="text-center">
              <a
                href="https://wa.me/51935841065?text=Hola,%20quiero%20informacion%20sobre%20los%20servicios%20veterinarios"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 bg-green-500 hover:bg-green-600 shadow-lg text-lg px-8">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Escribenos por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-drago.jpg"
                alt="Veterinaria Drago"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-xl font-bold">Veterinaria Drago</span>
            </div>
            <p className="text-sky-200 text-center">
              Dedicados al cuidado de tu mascota
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=100075993964145"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-300 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/51935841065"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-300 hover:text-green-400 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-sky-800 mt-8 pt-8 text-center text-sky-300 text-sm">
            © {new Date().getFullYear()} Veterinaria Drago. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
