
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
      .order('completed', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Portfolio items fetched:', data);
    return data as PortfolioItem[];
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
      .order('completed', { ascending: false });

    if (error) throw error;
    console.log('Featured portfolio items fetched:', data);
    return data as PortfolioItem[];
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
    console.log('Portfolio item fetched:', data);
    return data as PortfolioItem;
  } catch (error: any) {
    console.error('Error fetching portfolio item:', error.message);
    return null;
  }
};

// Create or update portfolio item
export const savePortfolioItem = async (item: PortfolioItem) => {
  try {
    console.log('Saving portfolio item:', item);
    
    // Convert completed date to ISO string if it's a Date object
    const itemToSave = {
      ...item,
      completed: item.completed instanceof Date 
        ? item.completed.toISOString() 
        : item.completed
    };

    console.log('Transformed item to save:', itemToSave);

    const { data, error } = await supabase
      .from('portfolio_items')
      .upsert(itemToSave)
      .select();

    if (error) {
      console.error('Supabase error while saving:', error);
      throw error;
    }
    
    console.log('Portfolio item saved successfully:', data);
    return data[0] as PortfolioItem;
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
