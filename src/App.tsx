import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Save, X, Tag, Star, ChevronLeft, ChevronRight, File } from 'lucide-react';
import LinkForm from './components/LinkForm';
import LinkCollection from './components/LinkCollection';
import SearchBar from './components/SearchBar';
import { LinkGroup } from './types';
import { addDocument, deleteDocument, subscribeToCollection } from './firebase';

function App() {
  const [linkGroups, setLinkGroups] = useState<LinkGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeFileTypes, setActiveFileTypes] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllFileTypes, setShowAllFileTypes] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    const unsubscribe = subscribeToCollection<LinkGroup>('minhaColecao', (updatedData) => {
      setLinkGroups(updatedData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addLinkGroup = async (newLinkGroup: LinkGroup) => {
    try {
      await addDocument('minhaColecao', newLinkGroup);
    } catch (error) {
      console.error('Error adding link group:', error);
    }
  };

  const updateLinkGroup = (updatedLinkGroup: LinkGroup) => {
    setLinkGroups(
      linkGroups.map((group) => 
        group.id === updatedLinkGroup.id ? updatedLinkGroup : group
      )
    );
    setEditingId(null);
  };

  const deleteLinkGroup = async (id: string) => {
    try {
      await deleteDocument('minhaColecao', id);
      if (editingId === id) {
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error deleting link group:', error);
    }
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleTagClick = (tag: string) => {
    setActiveTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleFileTypeClick = (fileType: string) => {
    setActiveFileTypes(prev => {
      if (prev.includes(fileType)) {
        return prev.filter(t => t !== fileType);
      }
      return [...prev, fileType];
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveTags([]);
    setActiveFileTypes([]);
    setSearchTerm('');
    setShowOnlyFavorites(false);
    setCurrentPage(1);
  };

  const toggleFavorite = (id: string) => {
    setLinkGroups(
      linkGroups.map((group) => 
        group.id === id ? { ...group, isFavorite: !group.isFavorite } : group
      )
    );
  };

  const getFileTypeFromTitle = (title: string): string | null => {
    const match = title.match(/\.(pdf|rar|zip|png|jpg|jpeg|doc|docx|xls|xlsx|txt)$/i);
    return match ? match[1].toLowerCase() : null;
  };

  const allTags = Array.from(
    new Set(
      linkGroups.flatMap(group => group.tags || [])
    )
  ).sort();

  const allFileTypes = Array.from(
    new Set(
      linkGroups
        .map(group => getFileTypeFromTitle(group.title))
        .filter((type): type is string => type !== null)
    )
  ).sort();

  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = linkGroups.filter(group => group.tags?.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  const fileTypeCounts = allFileTypes.reduce((acc, type) => {
    acc[type] = linkGroups.filter(group => getFileTypeFromTitle(group.title) === type).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredLinkGroups = linkGroups.filter((group) => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = activeTags.length === 0 || 
      activeTags.every(tag => group.tags?.includes(tag));
    const matchesFileType = activeFileTypes.length === 0 ||
      (getFileTypeFromTitle(group.title) !== null && 
       activeFileTypes.includes(getFileTypeFromTitle(group.title)!));
    const matchesFavorite = showOnlyFavorites ? group.isFavorite : true;
    return matchesSearch && matchesTags && matchesFileType && matchesFavorite;
  });

  const sortedLinkGroups = [...filteredLinkGroups].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.createdAt - a.createdAt;
  });

  const totalPages = Math.ceil(sortedLinkGroups.length / itemsPerPage);
  const paginatedGroups = sortedLinkGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const favoritesCount = linkGroups.filter(group => group.isFavorite).length;
  const foldersCount = linkGroups.filter(group => !getFileTypeFromTitle(group.title)).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">Link Organizer</h1>
          <p className="text-gray-600">Store and organize your important links in one place</p>
          <div className="mt-4 text-sm text-gray-600">
            Total Collections: <span className="font-semibold">{linkGroups.length}</span>
            {favoritesCount > 0 && (
              <span className="ml-3">
                Favorites: <span className="font-semibold">{favoritesCount}</span>
              </span>
            )}
            <span className="ml-3">
              Folders: <span className="font-semibold">{foldersCount}</span>
            </span>
          </div>
        </header>

        <div className="mb-8">
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={(term) => {
              setSearchTerm(term);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-col space-y-4 mb-6">
          {/* Tags Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Tag size={16} className="text-indigo-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-700">Filter by tags:</h3>
              </div>
              {allTags.length > 6 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {showAllTags ? 'Show less' : 'Show all tags'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(showAllTags ? allTags : allTags.slice(0, 6)).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag} ({tagCounts[tag]})
                </button>
              ))}
            </div>
          </div>

          {/* File Types Filter */}
          {allFileTypes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <File size={16} className="text-indigo-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Filter by file type:</h3>
                </div>
                {allFileTypes.length > 6 && (
                  <button
                    onClick={() => setShowAllFileTypes(!showAllFileTypes)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {showAllFileTypes ? 'Show less' : 'Show all types'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(showAllFileTypes ? allFileTypes : allFileTypes.slice(0, 6)).map(fileType => (
                  <button
                    key={fileType}
                    onClick={() => handleFileTypeClick(fileType)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      activeFileTypes.includes(fileType)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    .{fileType} ({fileTypeCounts[fileType]})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {(activeTags.length > 0 || activeFileTypes.length > 0 || showOnlyFavorites) && (
            <button 
              onClick={clearFilters}
              className="self-start text-xs text-indigo-600 hover:text-indigo-800"
            >
              Clear all filters
            </button>
          )}
        </div>

        {favoritesCount > 0 && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites);
                setCurrentPage(1);
              }}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                showOnlyFavorites 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Star size={16} className={`mr-2 ${showOnlyFavorites ? 'fill-white' : 'fill-amber-400'}`} />
              Show Favorites Only
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Plus size={20} className="mr-2 text-indigo-600" />
              Add New Collection
            </h2>
            <LinkForm onSubmit={addLinkGroup} />
          </div>

          <div className="md:col-span-2">
            {paginatedGroups.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedGroups.map((group) => (
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
                      fileType={getFileTypeFromTitle(group.title)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm || activeTags.length > 0 || activeFileTypes.length > 0 || showOnlyFavorites
                    ? "No collections match your filters" 
                    : "No link collections yet. Add your first collection!"}
                </p>
                {(searchTerm || activeTags.length > 0 || activeFileTypes.length > 0 || showOnlyFavorites) && (
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