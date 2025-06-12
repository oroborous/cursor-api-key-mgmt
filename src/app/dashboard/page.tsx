'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      await fetchApiKeys();
      setIsModalOpen(false);
      setNewKeyName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete API key');
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskApiKey = (key: string) => {
    return '•'.repeat(32);
  };

  const startEditing = (apiKey: ApiKey) => {
    setEditingKeyId(apiKey.id);
    setEditingName(apiKey.name);
  };

  const cancelEditing = () => {
    setEditingKeyId(null);
    setEditingName('');
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (!response.ok) throw new Error('Failed to update API key name');
      await fetchApiKeys();
      setEditingKeyId(null);
      setEditingName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const copyToClipboard = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 1500);
    } catch (err) {
      setError('Failed to copy API key');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">API Key Management</h1>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to Home
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Create New API Key
            </button>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Create New API Key</h2>
                  <form onSubmit={handleCreateApiKey}>
                    <div className="mb-4">
                      <label htmlFor="keyName" className="block text-sm font-medium mb-2">
                        API Key Name
                      </label>
                      <input
                        ref={inputRef}
                        type="text"
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700"
                        placeholder="Enter a name for your API key"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setNewKeyName('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="mt-6 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="mt-6 space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex-1">
                      {editingKeyId === apiKey.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, apiKey.id)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700"
                            placeholder="Enter new name"
                          />
                          <button
                            onClick={() => saveEdit(apiKey.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            title="Save"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <button
                            onClick={() => startEditing(apiKey)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Edit name"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                        </p>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title={visibleKeys.has(apiKey.id) ? "Hide API key" : "Show API key"}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Copy API key"
                        >
                          {copiedKeyId === apiKey.id ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16.5V19a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0020 19v-7.5A2.25 2.25 0 0017.75 9.25H15.5m-10-2.5A2.25 2.25 0 017.75 4.5h7.5A2.25 2.25 0 0117.5 6.75v7.5a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 015 14.25v-7.5z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No API keys found. Create one to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 