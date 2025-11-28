import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Sofa, BedDouble, Droplets, SparklesIcon, ShieldCheck, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import lavagemSofasImg from "@/assets/services/lavagem-sofas.jpg";
import higienizacaoColchoesImg from "@/assets/services/higienizacao-colchoes.jpg";
import limpezaTapetesImg from "@/assets/services/limpeza-tapetes.jpg";
import limpezaEstofadosImg from "@/assets/services/limpeza-estofados.jpg";
import impermeabilizacaoImg from "@/assets/services/impermeabilizacao.jpg";
import lavagemTapetesImg from "@/assets/services/lavagem-tapetes.jpg";
import corteRestauroImg from "@/assets/services/corte-restauro.jpg";
import logo from "@/assets/logo.png";

const Servicos = () => {
  const services = [
    {
      id: 1,
      title: "Lavagem de Sofás",
      category: "Serviço",
      description:
        "Tratamento para manchas, odores e ácaros com nossa limpeza profissional.",
      image: lavagemSofasImg,
      icon: <Sofa className="h-6 w-6" />,
      link: "/servicos/lavagem-sofas",
    },
    {
      id: 2,
      title: "Higienização de Colchões",
      category: "Serviço",
      description:
        "Garanta noites mais saudáveis com a eliminação de bactérias e poeira.",
      image: higienizacaoColchoesImg,
      icon: <BedDouble className="h-6 w-6" />,
      link: "/servicos/higienizacao-colchoes",
    },
    {
      id: 3,
      title: "Limpeza de Tapetes",
      category: "Serviço",
      description:
        "Devolvemos a beleza e a higiene aos seus tapetes em casa ou no escritório.",
      image: limpezaTapetesImg,
      icon: <Droplets className="h-6 w-6" />,
      link: "/servicos/limpeza-tapetes",
    },
    {
      id: 4,
      title: "Limpeza de Estofados",
      category: "Serviço",
      description:
        "Remove seus sofás e poltronas com uma limpeza profunda que elimina sujeira, ácaros e odores, trazendo mais conforto.",
      image: limpezaEstofadosImg,
      icon: <SparklesIcon className="h-6 w-6" />,
      link: "/servicos/limpeza-estofados",
    },
    {
      id: 5,
      title: "Impermeabilização de Estofados",
      category: "Serviço",
      description:
        "Proteja seus sofás e poltronas contra líquidos e manchas, garantindo maior durabilidade e beleza por muito mais tempo.",
      image: impermeabilizacaoImg,
      icon: <ShieldCheck className="h-6 w-6" />,
      link: "/servicos/impermeabilizacao",
    },
    {
      id: 6,
      title: "Lavagem de Tapetes",
      category: "Serviço",
      description:
        "Revitalize seus tapetes com uma lavagem profissional que remove sujeira e deixa o ambiente mais limpo e fresco.",
      image: lavagemTapetesImg,
      icon: <Droplets className="h-6 w-6" />,
      link: "/servicos/lavagem-tapetes",
    },
    {
      id: 7,
      title: "Corte e Restauro de Tapetes",
      category: "Serviço",
      description:
        "Damos nova vida ao seu tapete! Restauração que respeita cada detalhe.",
      image: corteRestauroImg,
      icon: <Scissors className="h-6 w-6" />,
      link: "/servicos/corte-restauro",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Soluções para Higienização de Estofados em São Paulo
          </h1>
          <p className="text-lg md:text-xl max-w-4xl mx-auto">
            A MK Higienização oferece serviços de{" "}
            <strong>higienização de estofados em São Paulo</strong> com qualidade profissional e atendimento em domicílio.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-service-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
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
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="MK Higienização" className="h-16 w-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Veja o Resultado da Nossa Higienização de Estofados em São Paulo
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Resultados visíveis que mostram cuidado e a eficiência da MK na limpeza profunda de estofados em São Paulo
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            FALE CONOSCO AGORA!
          </Button>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              RENOVE SEUS ESTOFADOS HOJE MESMO!
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Entre em contato agora pelo WhatsApp e solicite
              um orçamento gratuito para sua casa ou empresa em São Paulo
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              FALE CONOSCO AGORA!
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Servicos;
