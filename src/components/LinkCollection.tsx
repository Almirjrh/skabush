import React from 'react';
import { Edit, Trash2, ExternalLink, Tag, Star, File, Folder } from 'lucide-react';
import { LinkGroup } from '../types';
import LinkForm from './LinkForm';

interface LinkCollectionProps {
  linkGroup: LinkGroup;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (linkGroup: LinkGroup) => void;
  onCancelEdit: () => void;
  onTagClick?: (tag: string) => void;
  onToggleFavorite: (id: string) => void;
  fileType: string | null;
}

const LinkCollection: React.FC<LinkCollectionProps> = ({
  linkGroup,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  onTagClick,
  onToggleFavorite,
  fileType
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = () => {
    if (!fileType) return <Folder size={16} className="text-gray-400" />;
    return <File size={16} className="text-gray-400" />;
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Collection</h3>
        <LinkForm 
          onSubmit={onUpdate} 
          initialData={linkGroup} 
          isEditing={true}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${
      linkGroup.isFavorite ? 'border-l-4 border-amber-400' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2">
            {getFileIcon()}
            <h3 className="text-xl font-semibold text-gray-800">{linkGroup.title}</h3>
            {fileType && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                .{fileType}
              </span>
            )}
            {linkGroup.isFavorite && (
              <span className="text-amber-500" title="Favorited">
                <Star size={16} className="fill-amber-400" />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">Added on {formatDate(linkGroup.createdAt)}</p>
          
          {linkGroup.tags && linkGroup.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {linkGroup.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 cursor-pointer hover:bg-indigo-200"
                  onClick={() => onTagClick && onTagClick(tag)}
                >
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleFavorite(linkGroup.id)}
            className={`p-1.5 rounded-full hover:bg-gray-100 ${
              linkGroup.isFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
            }`}
            title={linkGroup.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={18} className={linkGroup.isFavorite ? "fill-amber-400" : ""} />
          </button>
          <button
            onClick={() => onEdit(linkGroup.id)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            title="Edit collection"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(linkGroup.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
            title="Delete collection"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {linkGroup.links.map((link) => (
          <div key={link.id} className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
              >
                {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                <ExternalLink size={14} className="ml-1 inline" />
              </a>
            </div>
            {link.description && (
              <p className="text-sm text-gray-600 mt-1">{link.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkCollection;