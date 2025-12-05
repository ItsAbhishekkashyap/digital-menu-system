export interface MenuItemInput {
  name: string
  description?: string
  price: number
  image_url?: string
  order?: number
}

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  tags: string[];
  is_featured: boolean;
  is_visible: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
 

  items: MenuItem[];
};

