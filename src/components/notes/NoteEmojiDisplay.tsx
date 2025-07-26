import React, { useState, useEffect } from 'react';
import { Emoticon } from '../../types/note-comments';
import { getNoteEmoticon } from '../../services/noteCommentsService';

interface NoteEmojiDisplayProps {
  noteId: string;
  className?: string;
}

const NoteEmojiDisplay: React.FC<NoteEmojiDisplayProps> = ({ noteId, className = '' }) => {
  const [currentEmoticon, setCurrentEmoticon] = useState<Emoticon | null>(null);

  useEffect(() => {
    const loadCurrentEmoticon = async () => {
      const noteEmoticon = await getNoteEmoticon(noteId);
      setCurrentEmoticon(noteEmoticon?.emoticon || null);
    };
    loadCurrentEmoticon();
  }, [noteId]);

  if (!currentEmoticon) return null;

  return (
    <span className={`text-lg ${className}`} aria-label={currentEmoticon.name}>
      {currentEmoticon.emoji}
    </span>
  );
};

export default NoteEmojiDisplay;
