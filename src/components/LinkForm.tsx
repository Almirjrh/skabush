import React, { useState } from 'react';
import { Plus, X, Tag, Star } from 'lucide-react';
import { LinkGroup, Link } from '../types';

interface LinkFormProps {
  onSubmit: (linkGroup: LinkGroup) => void;
  initialData?: LinkGroup;
  isEditing?: boolean;
  onCancel?: () => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false,
  onCancel 
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [links, setLinks] = useState<Link[]>(
    initialData?.links || [{ id: crypto.randomUUID(), url: '', description: '' }]
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false);
  const [error, setError] = useState('');

  const addLinkField = () => {
    setLinks([...links, { id: crypto.randomUUID(), url: '', description: '' }]);
  };

  const removeLinkField = (id: string) => {
    if (links.length > 1) {
      setLinks(links.filter(link => link.id !== id));
    }
  };

  const updateLink = (id: string, field: 'url' | 'description', value: string) => {
    setLinks(
      links.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validLinks = links.filter(link => link.url.trim() !== '');
    if (validLinks.length === 0) {
      setError('At least one valid link is required');
      return;
    }

    const newLinkGroup: LinkGroup = {
      id: initialData?.id || crypto.randomUUID(),
      title: title.trim(),
      links: validLinks,
      createdAt: initialData?.createdAt || Date.now(),
      tags: tags,
      isFavorite: isFavorite,
    };

    onSubmit(newLinkGroup);

    // Reset form if not editing
    if (!isEditing) {
      setTitle('');
      setLinks([{ id: crypto.randomUUID(), url: '', description: '' }]);
      setTags([]);
      setIsFavorite(false);
    }
    
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Work Resources"
          />
        </div>
        <div className="pt-6">
          <button
            type="button"
            onClick={toggleFavorite}
            className={`p-2 rounded-full ${isFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={20} className={isFavorite ? "fill-amber-400" : ""} />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add tags (press Enter to add)"
            />
          </div>
          <button
            type="button"
            onClick={addTag}
            className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 text-indigo-500 hover:text-indigo-700"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Links</label>
        
        {links.map((link, index) => (
          <div key={link.id} className="flex space-x-2">
            <div className="flex-grow space-y-2">
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
              <input
                type="text"
                value={link.description}
                onChange={(e) => updateLink(link.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Description (optional)"
              />
            </div>
            <button
              type="button"
              onClick={() => removeLinkField(link.id)}
              className="self-start p-2 text-gray-400 hover:text-red-500"
              disabled={links.length === 1}
              title="Remove link"
            >
              <X size={18} />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addLinkField}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          <Plus size={16} className="mr-1" />
          Add another link
        </button>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {isEditing ? 'Update Collection' : 'Save Collection'}
        </button>
      </div>
    </form>
  );
};

export default LinkForm;