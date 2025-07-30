import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Check if the password exists in the database
      const { data, error } = await supabase
        .from('secure_login')
        .select('password')
        .eq('password', password);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Invalid password');
      }

      // Set cookie with 7-day expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `auth_token=${encodeURIComponent(password)}; expires=${expires.toUTCString()}; path=/; samesite=strict`;
      
      // Clear any previous errors and close the modal
      setError('');
      onSuccess();
    } catch (err) {
      setError('Invalid password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Enter Password</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
