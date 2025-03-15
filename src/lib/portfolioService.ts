
import { supabase } from './supabase';
import { PortfolioItem } from '@/types';
import { toast } from 'sonner';

// Get all portfolio items
export const getPortfolioItems = async () => {
  try {
    console.log('Fetching portfolio items...');
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    // Transform the data to match our frontend model
    const transformedData = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      client: item.client,
      completed: item.completed,
      technologies: item.technologies || [],
      featured: item.featured || false,
      featuredImage: item.featured_image,
      images: item.images || [],
      link: item.link
    }));
    
    console.log('Portfolio items fetched:', transformedData);
    return transformedData as PortfolioItem[];
  } catch (error: any) {
    console.error('Error fetching portfolio items:', error.message);
    toast.error('Erro ao carregar projetos: ' + error.message);
    return [];
  }
};

// Get featured portfolio items
export const getFeaturedPortfolioItems = async () => {
  try {
    console.log('Fetching featured portfolio items...');
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our frontend model
    const transformedData = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      client: item.client,
      completed: item.completed,
      technologies: item.technologies || [],
      featured: item.featured || false,
      featuredImage: item.featured_image,
      images: item.images || [],
      link: item.link
    }));
    
    console.log('Featured portfolio items fetched:', transformedData);
    return transformedData as PortfolioItem[];
  } catch (error: any) {
    console.error('Error fetching featured portfolio items:', error.message);
    return [];
  }
};

// Get portfolio item by id
export const getPortfolioItemById = async (id: string) => {
  try {
    console.log(`Fetching portfolio item with ID: ${id}`);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Transform the data to match our frontend model
    const transformedItem = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      client: data.client,
      completed: data.completed,
      technologies: data.technologies || [],
      featured: data.featured || false,
      featuredImage: data.featured_image,
      images: data.images || [],
      link: data.link
    };
    
    console.log('Portfolio item fetched:', transformedItem);
    return transformedItem as PortfolioItem;
  } catch (error: any) {
    console.error('Error fetching portfolio item:', error.message);
    return null;
  }
};

// Create or update portfolio item
export const savePortfolioItem = async (item: PortfolioItem) => {
  try {
    console.log('Saving portfolio item:', item);
    
    // Prepare the data for saving, handling Date objects and removing temporary ID
    const itemToSave: any = {
      title: item.title,
      description: item.description,
      category: item.category,
      client: item.client, // Make sure client field is included
      technologies: item.technologies || [],
      featured: item.featured || false,
      featured_image: item.featuredImage,
      images: item.images || [],
      link: item.link
    };
    
    // Only include ID if it's not a temporary one
    if (item.id && !item.id.toString().startsWith('temp-')) {
      itemToSave.id = item.id;
    }
    
    // Convert completed date to ISO string if it's a Date object
    if (item.completed) {
      if (item.completed instanceof Date) {
        itemToSave.completed = item.completed.toISOString();
      } else {
        // Handle any other format safely
        try {
          // Try to parse as a date if it's a string or convert from another format
          const date = new Date(item.completed as any);
          if (!isNaN(date.getTime())) {
            itemToSave.completed = date.toISOString();
          } else {
            // If parsing fails, use current date as fallback
            itemToSave.completed = new Date().toISOString();
          }
        } catch (e) {
          console.error("Error parsing date:", e);
          itemToSave.completed = new Date().toISOString();
        }
      }
    } else {
      itemToSave.completed = new Date().toISOString();
    }

    console.log('Transformed item to save:', itemToSave);

    const { data, error } = await supabase
      .from('portfolio_items')
      .upsert(itemToSave)
      .select();

    if (error) {
      console.error('Supabase error while saving:', error);
      throw error;
    }
    
    // Transform the returned data to match our frontend model
    const savedItem = {
      id: data[0].id,
      title: data[0].title,
      description: data[0].description,
      category: data[0].category,
      client: data[0].client,
      completed: data[0].completed,
      technologies: data[0].technologies || [],
      featured: data[0].featured || false,
      featuredImage: data[0].featured_image,
      images: data[0].images || [],
      link: data[0].link
    };
    
    console.log('Portfolio item saved successfully:', savedItem);
    return savedItem as PortfolioItem;
  } catch (error: any) {
    console.error('Error saving portfolio item:', error.message);
    toast.error('Erro ao salvar projeto: ' + error.message);
    throw error;
  }
};

// Delete portfolio item
export const deletePortfolioItem = async (id: string) => {
  try {
    console.log(`Deleting portfolio item with ID: ${id}`);
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('Portfolio item deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting portfolio item:', error.message);
    toast.error('Erro ao excluir projeto: ' + error.message);
    return false;
  }
};

// Upload image to storage
export const uploadPortfolioImage = async (file: File, portfolioId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${portfolioId}-${Date.now()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    console.log(`Uploading image: ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }
    console.log(`Image uploaded successfully: ${filePath}`);

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log(`Public URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error.message);
    toast.error('Erro ao fazer upload da imagem: ' + error.message);
    throw error;
  }
};
