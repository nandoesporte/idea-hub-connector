
import { supabase } from './supabase';
import { CategoryItem } from '@/types';

export const fetchCategories = async (): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error.message);
    }

    // Convert to CategoryItem format
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      iconColor: item.icon_color || 'text-primary',
      link: item.link || `/category/${item.id}`,
      type: item.type || 'tech',
      enabled: item.enabled !== false,
    }));
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

export const createCategory = async (category: Omit<CategoryItem, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          title: category.title,
          description: category.description,
          icon: category.icon,
          icon_color: category.iconColor,
          link: category.link,
          type: category.type,
          enabled: category.enabled,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      iconColor: data.icon_color || 'text-primary',
      link: data.link || `/category/${data.id}`,
      type: data.type || 'tech',
      enabled: data.enabled !== false,
    };
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, category: Partial<Omit<CategoryItem, 'id'>>) => {
  try {
    const updateData: any = {};
    
    if (category.title !== undefined) updateData.title = category.title;
    if (category.description !== undefined) updateData.description = category.description;
    if (category.icon !== undefined) updateData.icon = category.icon;
    if (category.iconColor !== undefined) updateData.icon_color = category.iconColor;
    if (category.link !== undefined) updateData.link = category.link;
    if (category.type !== undefined) updateData.type = category.type;
    if (category.enabled !== undefined) updateData.enabled = category.enabled;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      iconColor: data.icon_color || 'text-primary',
      link: data.link || `/category/${data.id}`,
      type: data.type || 'tech',
      enabled: data.enabled !== false,
    };
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};
