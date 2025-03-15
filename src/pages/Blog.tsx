
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';

const Blog = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Artigos, dicas e novidades sobre tecnologia, desenvolvimento web e transformação digital.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Este é um exemplo de card que será substituído por dados reais */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge>Desenvolvimento Web</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  <span>Hoje</span>
                </div>
              </div>
              <CardTitle className="mt-2">
                <Link to="/blog/post" className="hover:underline">
                  Como escolher a melhor tecnologia para seu projeto
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Um guia completo para ajudar você a escolher as melhores tecnologias para o seu próximo projeto digital.
              </p>
            </CardContent>
            <CardFooter className="pt-2 border-t">
              <Link to="/blog/post" className="text-sm text-primary hover:underline">
                Ler artigo completo
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Fique atento para mais artigos em breve.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
