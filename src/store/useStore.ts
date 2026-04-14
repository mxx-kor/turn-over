export interface Card {
  id: string;
  folder_id: string;
  front: string;
  back: string;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}
