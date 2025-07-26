export type EmoticonName =
  | 'Heart'
  | 'Thumbs Up'
  | 'Thumbs Down'
  | 'Eye Roll'
  | 'Happy'
  | 'Sad'
  | 'Thinking'
  | 'Excited'
  | 'Question'
  | 'Important'
  | 'Check';

export interface Emoticon {
  id: string;
  name: EmoticonName;
  emoji: string;
  created_at: string;
}

export interface Comment {
  id: string;
  note_id: string;
  parent_id: string | null;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface NoteEmoticon {
  id: string;
  note_id: string;
  emoticon_id: string;
  created_at: string;
  user_id: string | null;
  emoticon: Emoticon;
}
