import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Emoticon } from '../../types/note-comments';
import { getEmoticons, getNoteEmoticon, setNoteEmoticon, removeNoteEmoticon } from '../../services/noteCommentsService';

interface NoteEmoticonMenuProps {
  noteId: string;
  className?: string;
}

const NoteEmoticonMenu: React.FC<NoteEmoticonMenuProps> = ({ noteId, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);
  const [currentEmoticon, setCurrentEmoticon] = useState<Emoticon | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadEmoticons = async () => {
      const allEmoticons = await getEmoticons();
      setEmoticons(allEmoticons);
    };
    loadEmoticons();
  }, []);

  useEffect(() => {
    const loadCurrentEmoticon = async () => {
      try {
        const noteEmoticon = await getNoteEmoticon(noteId);
        // Handle case where emoticon might be an array
        const emoticonData = Array.isArray(noteEmoticon?.emoticon) 
          ? noteEmoticon?.emoticon[0] 
          : noteEmoticon?.emoticon;
        setCurrentEmoticon(emoticonData || null);
      } catch (error) {
        console.error('Error loading current emoticon:', error);
        setCurrentEmoticon(null);
      }
    };
    loadCurrentEmoticon();
  }, [noteId]);

  const handleEmoticonSelect = async (emoticon: Emoticon) => {
    if (currentEmoticon?.id === emoticon.id) {
      await removeNoteEmoticon(noteId);
      setCurrentEmoticon(null);
    } else {
      await setNoteEmoticon(noteId, emoticon.id);
      setCurrentEmoticon(emoticon);
    }
    setIsOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={toggleMenu}
        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${currentEmoticon ? 'bg-gray-100' : ''}`}
        aria-label="Select emoji"
      >
        <span className="text-lg">{currentEmoticon?.emoji || '😊'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="grid grid-cols-5 gap-1">
            {emoticons.map((emoticon) => (
              <button
                key={emoticon.id}
                onClick={() => handleEmoticonSelect(emoticon)}
                className={`p-2 rounded-md text-xl hover:bg-gray-100 transition-colors ${
                  currentEmoticon?.id === emoticon.id ? 'bg-blue-50' : ''
                }`}
                aria-label={emoticon.name}
                title={emoticon.name}
              >
                {emoticon.emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEmoticonMenu;
