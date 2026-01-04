import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './components/ThemeToggle';
import { SimpleList } from './components/SimpleList';
import { CatalogGrid } from './components/CatalogGrid';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CATALOG } from './data/catalog';
import { ShoppingCart, Search, Share2, Download, Clipboard, ArrowLeft, Grid } from 'lucide-react';
import './styles/index.css';

function App() {
  const { t } = useTranslation();

  // State: "My List" is now just a list of Selected Item IDs (+ custom items)
  // Structure: [ { id: 'c_apple', checked: false }, { id: 'custom_123', name: 'Foo', checked: true } ]
  const [savedItems, setSavedItems] = useLocalStorage('my_list_v2', []);
  const [viewMode, setViewMode] = useState('catalog'); // 'catalog' | 'list'
  const [searchTerm, setSearchTerm] = useState('');

  // Helper: Get full object for saved items
  const myFullList = useMemo(() => {
    return savedItems.map(saved => {
      // Is it a catalog item?
      const catalogItem = CATALOG.find(c => c.id === saved.id);
      if (catalogItem) {
        return { ...catalogItem, ...saved }; // Merge catalog data with saved state (checked)
      }
      return saved; // Access custom item directly
    });
  }, [savedItems]);

  const selectedIds = new Set(savedItems.map(i => i.id));

  // Handlers
  const toggleCatalogItem = (item) => {
    setSavedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        // Remove from list
        return prev.filter(i => i.id !== item.id);
      } else {
        // Add to list
        return [...prev, { id: item.id, name: item.name, checked: false }];
      }
    });
  };

  const addCustomItem = (name) => {
    const newItem = {
      id: `custom_${Date.now()}`,
      name,
      checked: false,
      isCustom: true
    };
    setSavedItems(prev => [...prev, newItem]);
    setSearchTerm(''); // Clear search after add
  };

  const toggleCheck = (id) => {
    setSavedItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  // Export
  const handlePrint = () => window.print();

  const handleCopy = () => {
    const text = myFullList
      .map(item => `${item.checked ? '[x]' : '[ ]'} ${item.name}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('List copied!');
  };

  return (
    <div className="min-h-screen">
      <header className="app-header no-print">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-badge">
              <ShoppingCart size={24} />
            </div>
            <h1>{t('app_title')}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container" style={{ marginTop: '1.5rem' }}>

        {/* Navigation Tabs (View Mode) */}
        <div className="view-toggle no-print" style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem'
        }}>
          <button
            className={`toggle-btn ${viewMode === 'catalog' ? 'active' : ''}`}
            onClick={() => setViewMode('catalog')}
            style={{ flex: 1 }}
          >
            <Grid size={18} /> Browse Catalog
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            style={{ flex: 1 }}
          >
            <ShoppingCart size={18} /> My List ({savedItems.length})
          </button>
        </div>

        {viewMode === 'catalog' && (
          <div className="catalog-view fade-in">
            <div className="search-bar" style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search items (e.g. Milk, Apple)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}
                >
                  Clear
                </button>
              )}
            </div>

            <CatalogGrid
              items={CATALOG}
              selectedIds={selectedIds}
              searchTerm={searchTerm}
              onToggle={toggleCatalogItem}
              onAddCustom={addCustomItem}
            />
          </div>
        )}

        {(viewMode === 'list' || window.matchMedia('print').matches) && (
          <div className="list-view fade-in">
            <div className="actions-toolbar no-print" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>My Shopping List</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={async () => {
                    if (!window.html2canvas) {
                      alert('Image generation library not loaded yet. Please try again.');
                      return;
                    }

                    const element = document.querySelector('.list-view');
                    const btnToolbar = document.querySelector('.actions-toolbar');

                    // Temporarily hide toolbar for screenshot
                    if (btnToolbar) btnToolbar.style.display = 'none';

                    try {
                      const canvas = await window.html2canvas(element, {
                        useCORS: true,
                        backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
                        scale: 2 // Better resolution
                      });

                      if (btnToolbar) btnToolbar.style.display = 'flex'; // Restore toolbar

                      canvas.toBlob(async (blob) => {
                        if (!blob) return;

                        // Create file
                        const file = new File([blob], 'shopping-list.png', { type: 'image/png' });

                        // Try Native Share
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                          try {
                            await navigator.share({
                              files: [file],
                              title: 'My Shopping List',
                              text: 'Here is my shopping list from My Home Kitchen!'
                            });
                          } catch (err) {
                            console.error('Share failed', err);
                          }
                        } else {
                          // Fallback to Download
                          const link = document.createElement('a');
                          link.download = 'shopping-list.png';
                          link.href = canvas.toDataURL();
                          link.click();
                          alert('Image saved to downloads (Sharing not supported on this device/browser)');
                        }
                      });

                    } catch (err) {
                      console.error('Screenshot failed', err);
                      if (btnToolbar) btnToolbar.style.display = 'flex';
                      alert('Could not generate image.');
                    }
                  }}
                  className="btn btn-icon"
                  title="Share Image"
                >
                  <Share2 size={18} />
                </button>
                <button onClick={handleCopy} className="btn btn-icon" title="Copy Text"><Clipboard size={18} /></button>
                <button onClick={handlePrint} className="btn btn-icon" title="Print/PDF"><Download size={18} /></button>
              </div>
            </div>

            <SimpleList
              items={myFullList}
              onAdd={addCustomItem} // Still allow adding from here potentially
              onToggle={toggleCheck}
              onDelete={deleteItem}
            />
          </div>
        )}

      </main>

      <style>{`
        .logo-badge {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          padding: 0.5rem;
          borderRadius: var(--radius-md);
          color: white;
        }
        .toggle-btn {
          padding: 0.75rem;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background-color: var(--bg-card);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.5rem;
          font-size: 1rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-main);
        }
        .search-input:focus {
          outline: 2px solid var(--primary);
          border-color: transparent;
        }
        @media print {
          .view-toggle, .search-bar, .catalog-view { display: none !important; }
          .list-view { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
