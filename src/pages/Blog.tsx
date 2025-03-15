
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

const Blog = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <div className="grid gap-6">
          <div className="p-6 border rounded-lg shadow-sm">
            <p className="text-center text-muted-foreground">
              Nenhum artigo publicado ainda.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
