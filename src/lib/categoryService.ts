
import { supabase } from './supabase';
import { CategoryItem } from '@/types';

export const fetchCategories = async (type?: 'tech') => {
  let query = supabase.from('categories').select('*');
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('title');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data as CategoryItem[];
};

export const createCategory = async (category: Omit<CategoryItem, 'id'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }
  
  return data as CategoryItem;
};

export const updateCategory = async (id: string, category: Partial<Omit<CategoryItem, 'id'>>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
  
  return data as CategoryItem;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
  
  return true;
};
