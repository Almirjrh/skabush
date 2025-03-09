import { DocumentData } from 'firebase/firestore';

export interface Link {
  id: string;
  url: string;
  description: string;
}

export interface LinkGroup extends DocumentData {
  id: string;
  title: string;
  links: Link[];
  createdAt: number;
  tags: string[];
  isFavorite: boolean;
}