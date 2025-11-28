import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Award, Users, Target, Heart } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre a MK Higienização</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Especialistas em higienização de estofados em São Paulo
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                A MK Higienização é especialista em seu bem estar e de sua família, garantindo um
                ambiente saudável. Com isso, ela traz o cuidado e a eficiência na limpeza profunda
                de estofados em São Paulo de forma econômica e sustentável.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                A MK Higienização conta com um atendimento diferenciado, sempre priorizando a
                qualidade dos serviços e a satisfação de nossos clientes.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-secondary p-6 rounded-lg">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Qualidade</h3>
                <p className="text-muted-foreground">
                  Utilizamos produtos de alta qualidade e técnicas profissionais para garantir os
                  melhores resultados.
                </p>
              </div>
              <div className="bg-secondary p-6 rounded-lg">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Atendimento</h3>
                <p className="text-muted-foreground">
                  Nossa equipe é treinada para oferecer o melhor atendimento, sempre prezando pela
                  satisfação do cliente.
                </p>
              </div>
              <div className="bg-secondary p-6 rounded-lg">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Eficiência</h3>
                <p className="text-muted-foreground">
                  Processos otimizados que garantem resultados rápidos sem comprometer a qualidade
                  do serviço.
                </p>
              </div>
              <div className="bg-secondary p-6 rounded-lg">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Compromisso</h3>
                <p className="text-muted-foreground">
                  Nosso compromisso é com a saúde e bem-estar da sua família, oferecendo ambientes
                  mais limpos e saudáveis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sobre;
