import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "Como manter seus sofás limpos por mais tempo",
      excerpt:
        "Dicas práticas para manter seus estofados sempre limpos e conservados entre as limpezas profissionais.",
      date: "15 Mar 2024",
    },
    {
      id: 2,
      title: "A importância da higienização de colchões",
      excerpt:
        "Descubra como a limpeza regular do colchão pode melhorar sua saúde e qualidade do sono.",
      date: "10 Mar 2024",
    },
    {
      id: 3,
      title: "Impermeabilização: vale a pena?",
      excerpt:
        "Entenda os benefícios de impermeabilizar seus estofados e como isso pode prolongar sua vida útil.",
      date: "5 Mar 2024",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg md:text-xl">
            Dicas e novidades sobre higienização de estofados
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{post.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="outline" className="w-full">
                    Ler mais
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
