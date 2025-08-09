import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Link, List, ListOrdered, Quote, Code, Image, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = "Commencez à écrire..." }) => {
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !isPreview && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isPreview]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Force focus back to editor after command
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent some default behaviors that might cause issues
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  };
  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Gras' },
    { icon: Italic, command: 'italic', title: 'Italique' },
    { icon: Underline, command: 'underline', title: 'Souligné' },
    { icon: Link, command: 'link', title: 'Lien', action: insertLink },
    { icon: List, command: 'insertUnorderedList', title: 'Liste à puces' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Liste numérotée' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Citation' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code' },
    { icon: Image, command: 'image', title: 'Image', action: insertImage },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Aligner à gauche' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Centrer' },
    { icon: AlignRight, command: 'justifyRight', title: 'Aligner à droite' }
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {toolbarButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => button.action ? button.action() : execCommand(button.command, button.value)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title={button.title}
              >
                <Icon size={16} />
              </button>
            );
          })}
          
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isPreview 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {isPreview ? 'Éditer' : 'Aperçu'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[300px]">
        {isPreview ? (
          <div 
            className="p-4 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="p-4 min-h-[300px] focus:outline-none"
            style={{ 
              minHeight: '300px',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal'
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
          direction: ltr;
        }
        
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          direction: ltr;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0;
          direction: ltr;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0;
          direction: ltr;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
          line-height: 1.6;
          direction: ltr;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #E5E7EB;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6B7280;
          direction: ltr;
        }
        
        [contenteditable] pre {
          background-color: #F3F4F6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          direction: ltr;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
          direction: ltr;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
          direction: ltr;
        }
        
        [contenteditable] a {
          color: #7C3AED;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;