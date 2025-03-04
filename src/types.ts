export interface Link {
  id: string;
  url: string;
  description: string;
}

export interface LinkGroup {
  id: string;
  title: string;
  links: Link[];
  createdAt: number;
  tags: string[];
  isFavorite: boolean;
}