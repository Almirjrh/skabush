import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Save, X, Tag, Star } from 'lucide-react';
import LinkForm from './components/LinkForm';
import LinkCollection from './components/LinkCollection';
import SearchBar from './components/SearchBar';
import { LinkGroup } from './types';

function App() {
  const [linkGroups, setLinkGroups] = useState<LinkGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedLinkGroups = localStorage.getItem('linkGroups');
    if (savedLinkGroups) {
      setLinkGroups(JSON.parse(savedLinkGroups));
    }
  }, []);

  // Save data to localStorage whenever linkGroups changes
  useEffect(() => {
    localStorage.setItem('linkGroups', JSON.stringify(linkGroups));
  }, [linkGroups]);

  const addLinkGroup = (newLinkGroup: LinkGroup) => {
    setLinkGroups([...linkGroups, newLinkGroup]);
  };

  const updateLinkGroup = (updatedLinkGroup: LinkGroup) => {
    setLinkGroups(
      linkGroups.map((group) => 
        group.id === updatedLinkGroup.id ? updatedLinkGroup : group
      )
    );
    setEditingId(null);
  };

  const deleteLinkGroup = (id: string) => {
    setLinkGroups(linkGroups.filter((group) => group.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
      setSearchTerm('');
    }
  };

  const clearFilters = () => {
    setActiveTag(null);
    setSearchTerm('');
    setShowOnlyFavorites(false);
  };

  const toggleFavorite = (id: string) => {
    setLinkGroups(
      linkGroups.map((group) => 
        group.id === id ? { ...group, isFavorite: !group.isFavorite } : group
      )
    );
  };

  // Get all unique tags from all link groups
  const allTags = Array.from(
    new Set(
      linkGroups.flatMap(group => group.tags || [])
    )
  ).sort();

  // Filter link groups based on search term, active tag, and favorites
  const filteredLinkGroups = linkGroups.filter((group) => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag ? (group.tags || []).includes(activeTag) : true;
    const matchesFavorite = showOnlyFavorites ? group.isFavorite : true;
    return matchesSearch && matchesTag && matchesFavorite;
  });

  // Sort link groups to show favorites first
  const sortedLinkGroups = [...filteredLinkGroups].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  // Count favorites
  const favoritesCount = linkGroups.filter(group => group.isFavorite).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">Link Organizer</h1>
          <p className="text-gray-600">Store and organize your important links in one place</p>
        </header>

        <div className="mb-8">
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {favoritesCount > 0 && (
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                showOnlyFavorites 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Star size={16} className={`mr-2 ${showOnlyFavorites ? 'fill-white' : 'fill-amber-400'}`} />
              Favorites ({favoritesCount})
            </button>
          )}

          {allTags.length > 0 && (
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Tag size={16} className="text-indigo-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-700">Filter by tag:</h3>
                {(activeTag || showOnlyFavorites) && (
                  <button 
                    onClick={clearFilters}
                    className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeTag === tag 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Plus size={20} className="mr-2 text-indigo-600" />
              Add New Collection
            </h2>
            <LinkForm onSubmit={addLinkGroup} />
          </div>

          <div className="md:col-span-2">
            {sortedLinkGroups.length > 0 ? (
              <div className="space-y-4">
                {sortedLinkGroups.map((group) => (
                  <LinkCollection
                    key={group.id}
                    linkGroup={group}
                    isEditing={editingId === group.id}
                    onEdit={startEditing}
                    onDelete={deleteLinkGroup}
                    onUpdate={updateLinkGroup}
                    onCancelEdit={cancelEditing}
                    onTagClick={handleTagClick}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm || activeTag || showOnlyFavorites
                    ? "No collections match your filters" 
                    : "No link collections yet. Add your first collection!"}
                </p>
                {(searchTerm || activeTag || showOnlyFavorites) && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;