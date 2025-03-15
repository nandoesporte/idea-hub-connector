
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

const BlogPost = () => {
  const { id } = useParams();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Artigo do Blog</h1>
        <p className="text-muted-foreground">
          Esta página está em construção. ID do artigo: {id}
        </p>
      </div>
    </MainLayout>
  );
};

export default BlogPost;
