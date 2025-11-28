import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Depoimentos = () => {
  const testimonials = [
    {
      id: 1,
      name: "Maria Silva",
      text: "Excelente serviço! Meu sofá ficou como novo. A equipe foi muito profissional e atenciosa.",
      rating: 5,
    },
    {
      id: 2,
      name: "João Santos",
      text: "Recomendo demais! Fizeram a limpeza de todos os meus estofados e o resultado superou minhas expectativas.",
      rating: 5,
    },
    {
      id: 3,
      name: "Ana Paula",
      text: "Serviço de qualidade e preço justo. Meus colchões ficaram higienizados e sem manchas.",
      rating: 5,
    },
    {
      id: 4,
      name: "Carlos Eduardo",
      text: "Pontualidade e eficiência! A limpeza dos tapetes foi impecável. Com certeza voltarei a contratar.",
      rating: 5,
    },
    {
      id: 5,
      name: "Fernanda Costa",
      text: "Profissionais muito atenciosos. Explicaram todo o processo e deixaram minha casa linda!",
      rating: 5,
    },
    {
      id: 6,
      name: "Roberto Alves",
      text: "Melhor empresa de higienização que já contratei. Resultado visível e duradouro.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Depoimentos</h1>
          <p className="text-lg md:text-xl">
            Veja o que nossos clientes dizem sobre nossos serviços
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-service-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{testimonial.text}</p>
                  <p className="font-bold text-primary">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Depoimentos;
