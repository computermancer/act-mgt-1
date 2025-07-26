import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Comment } from '../../types/note-comments';
import { getNoteComments, addComment, updateComment, deleteComment, testSupabaseConnection } from '../../services/noteCommentsService';

interface NoteCommentsProps {
  noteId: string;
}

const NoteComments: React.FC<NoteCommentsProps> = ({ noteId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const commentsData = await getNoteComments(noteId);
        // Convert flat comments to a nested structure
        const nestedComments = buildNestedComments(commentsData);
        setComments(nestedComments);
      } catch (err) {
        console.error('Error loading comments:', err);
        setError('Failed to load comments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadComments();
  }, [noteId]);

  // Helper function to convert flat comments to a nested structure
  const buildNestedComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build the tree
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(commentWithReplies!);
        }
      } else {
        rootComments.push(commentWithReplies!);
      }
    });

    return rootComments;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setError(null);
      console.log('Adding comment with:', { noteId, content: newComment, parentId: replyingTo });
      const comment = await addComment(noteId, newComment, replyingTo || undefined);
      console.log('Comment added successfully:', comment);
      
      if (replyingTo) {
        setComments(prevComments => 
          prevComments.map(c => 
            c.id === replyingTo 
              ? { 
                  ...c, 
                  replies: [
                    ...(c.replies || []), 
                    { ...comment, replies: [] } 
                  ] 
                } 
              : c
          )
        );
      } else {
        setComments(prev => [{ ...comment, replies: [] }, ...prev]);
      }
      
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error adding comment:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        noteId,
        content: newComment,
        parentId: replyingTo
      });
      setError(`Failed to add comment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setError(null);
      const updatedComment = await updateComment(commentId, editContent);
      
      setComments(prevComments => 
        updateComments(prevComments, commentId, {
          ...updatedComment,
          // Preserve the replies when updating
          replies: findComment(prevComments, commentId)?.replies || []
        })
      );
      
      setEditingComment(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setError(null);
      await deleteComment(commentId);
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const toggleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setEditingComment(null);
  };

  const findComment = (comments: Comment[], id: string): Comment | undefined => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = findComment(comment.replies, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const updateComments = (comments: Comment[], commentId: string, updatedComment: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...updatedComment,
          replies: comment.replies // Preserve existing replies
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateComments(comment.replies, commentId, updatedComment)
        };
      }
      return comment;
    });
  };

  const renderComment = (comment: Comment) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className="mb-4 pl-4 border-l-2 border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">
                {comment.author_name || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            {isEditing ? (
              <div className="mt-1">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-gray-800">{comment.content}</p>
            )}
            <div className="mt-1 flex space-x-4">
              <button
                onClick={() => {
                  setReplyingTo(isReplying ? null : comment.id);
                  setNewComment('');
                }}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                {isReplying ? 'Cancel Reply' : 'Reply'}
              </button>
              <button
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            
            {/* Reply form */}
            {isReplying && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newComment.trim()) {
                    handleAddComment(e);
                  }
                }}
                className="mt-2 ml-4"
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full p-2 border rounded"
                      rows={2}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Post Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 mt-2 pl-2 border-l-2 border-gray-100">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  // Render top-level comments
  const renderComments = (parentId: string | null = null) => {
    const filteredComments = comments.filter(comment => 
      comment.parent_id === parentId
    );

    if (filteredComments.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {filteredComments.map(comment => renderComment(comment))}
      </div>
    );
  };



  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Main comment form */}
      <form onSubmit={handleAddComment} className="mb-6">
        <div className="flex items-start">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={async () => {
              console.log('Testing Supabase connection...');
              const isConnected = await testSupabaseConnection();
              if (isConnected) {
                alert('Successfully connected to Supabase!');
              } else {
                alert('Failed to connect to Supabase. Check console for details.');
              }
            }}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
          >
            Test Database Connection
          </button>
        </div>
        {comments.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        )} 
        {comments.length > 0 && (
          renderComments()
        )}
      </div>
    </div>
  );
};

export default NoteComments;
