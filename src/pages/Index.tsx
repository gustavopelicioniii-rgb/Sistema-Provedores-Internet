import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Sofa, BedDouble, Droplets, SparklesIcon, ShieldCheck, CheckCircle } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import lavagemSofasImg from "@/assets/services/lavagem-sofas.jpg";
import higienizacaoColchoesImg from "@/assets/services/higienizacao-colchoes.jpg";
import limpezaTapetesImg from "@/assets/services/limpeza-tapetes.jpg";
import limpezaEstofadosImg from "@/assets/services/limpeza-estofados.jpg";
import impermeabilizacaoImg from "@/assets/services/impermeabilizacao.jpg";
import lavagemTapetesImg from "@/assets/services/lavagem-tapetes.jpg";

const Index = () => {
  const featuredServices = [
    {
      id: 1,
      title: "Lavagem de Sofás",
      category: "Serviço",
      description: "Tratamento para manchas, odores e ácaros com nossa limpeza profissional.",
      image: lavagemSofasImg,
      icon: <Sofa className="h-6 w-6" />,
      link: "/servicos/lavagem-sofas",
    },
    {
      id: 2,
      title: "Higienização de Colchões",
      category: "Serviço",
      description: "Garanta noites mais saudáveis com a eliminação de bactérias e poeira.",
      image: higienizacaoColchoesImg,
      icon: <BedDouble className="h-6 w-6" />,
      link: "/servicos/higienizacao-colchoes",
    },
    {
      id: 3,
      title: "Limpeza de Tapetes",
      category: "Serviço",
      description: "Devolvemos a beleza e a higiene aos seus tapetes em casa ou no escritório.",
      image: limpezaTapetesImg,
      icon: <Droplets className="h-6 w-6" />,
      link: "/servicos/limpeza-tapetes",
    },
    {
      id: 4,
      title: "Limpeza de Estofados",
      category: "Serviço",
      description:
        "Remove seus sofás e poltronas com uma limpeza profunda que elimina sujeira, ácaros e odores.",
      image: limpezaEstofadosImg,
      icon: <SparklesIcon className="h-6 w-6" />,
      link: "/servicos/limpeza-estofados",
    },
    {
      id: 5,
      title: "Impermeabilização",
      category: "Serviço",
      description: "Proteja seus sofás e poltronas contra líquidos e manchas.",
      image: impermeabilizacaoImg,
      icon: <ShieldCheck className="h-6 w-6" />,
      link: "/servicos/impermeabilizacao",
    },
    {
      id: 6,
      title: "Lavagem de Tapetes",
      category: "Serviço",
      description: "Revitalize seus tapetes com uma lavagem profissional.",
      image: lavagemTapetesImg,
      icon: <Droplets className="h-6 w-6" />,
      link: "/servicos/lavagem-tapetes",
    },
  ];

  const benefits = [
    "Atendimento em domicílio",
    "Equipamentos profissionais",
    "Produtos de alta qualidade",
    "Secagem rápida",
    "Profissionais qualificados",
    "Orçamento gratuito",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Soluções completas em Higienização de Estofados em SP
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Qualidade profissional, atendimento em domicílio
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8">
            PEÇA SEU ORÇAMENTO
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-service-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                category={service.category}
                description={service.description}
                image={service.image}
                icon={service.icon}
                link={service.link}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <a href="/servicos">Ver todos os serviços</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
            Por que escolher a MK Higienização?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-accent flex-shrink-0" />
                <span className="text-lg text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para ter seus estofados limpos e higienizados?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Entre em contato agora e solicite um orçamento gratuito
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8"
          >
            FALE CONOSCO AGORA
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
