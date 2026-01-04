import { useMemo, useState, useRef } from 'react';
import { getIconForProduct } from '../utils/icons';
import { Accordion } from './Accordion';
import { Plus, Check, Star, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Import all product images eagerly
const productImages = import.meta.glob('../assets/products/*.{png,jpg,jpeg,webp}', { eager: true });

export function CatalogGrid({ items, selectedIds, searchTerm, onToggle, onAddCustom }) {
    const { t } = useTranslation();
    const [previewItem, setPreviewItem] = useState(null);
    const [imageOverrides, setImageOverrides] = useLocalStorage('product_images_v1', {});
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Helper to get localization key from category string (strips emojis/extra whitespace)
    const getCatKey = (cat) => cat.replace(/[^\x00-\x7F\s&]/g, '').trim();

    // 1. Filter items based on search
    const filteredItems = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return items.filter(item => {
            const translatedName = t(item.name).toLowerCase();
            const englishName = item.name.toLowerCase();
            const keywordMatch = item.keywords && item.keywords.some(k => k.includes(searchLower));

            return translatedName.includes(searchLower) ||
                englishName.includes(searchLower) ||
                keywordMatch;
        });
    }, [items, searchTerm, t]);

    const isExactMatchFound = filteredItems.some(i => i.name.toLowerCase() === searchTerm.toLowerCase());

    // 2. Group by Category
    const groupedItems = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            const cat = item.category || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [filteredItems]);

    // Favorites Logic (Top 25 items)
    const favoriteItems = useMemo(() => items.slice(0, 12), [items]);
    const favoriteIds = useMemo(() => new Set(favoriteItems.map(i => i.id)), [favoriteItems]);

    // Categories sorted by "Favorite Density" (how many items in this category are in favorites)
    const categories = useMemo(() => {
        const catList = Object.keys(groupedItems);
        return catList.sort((a, b) => {
            const countA = groupedItems[a].filter(i => favoriteIds.has(i.id)).length;
            const countB = groupedItems[b].filter(i => favoriteIds.has(i.id)).length;
            if (countA !== countB) return countB - countA; // Higher density first
            return a.localeCompare(b); // Then alphabetical
        });
    }, [groupedItems, favoriteIds]);

    // Handle Category Navigation
    const handleNav = (direction) => {
        if (!expandedCategory || expandedCategory === 'Favorites') return;
        const currentIndex = categories.indexOf(expandedCategory);
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % categories.length;
        } else {
            nextIndex = (currentIndex - 1 + categories.length) % categories.length;
        }
        setExpandedCategory(categories[nextIndex]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper to resolve image path
    const getProductImage = (item) => {
        if (imageOverrides[item.id]) {
            if (imageOverrides[item.id] === 'USE_ICON') return null;
            return imageOverrides[item.id];
        }
        if (!item.image) return null;
        const path = `../assets/products/${item.image}`;
        return productImages[path]?.default;
    };

    const handleUpdateImage = (itemId, newUrl) => {
        setImageOverrides(prev => ({ ...prev, [itemId]: newUrl }));
    };


    // SEARCH VIEW
    if (searchTerm) {
        return (
            <div className="catalog-container">
                {previewItem && (
                    <ImagePreviewModal
                        item={previewItem}
                        imageUrl={getProductImage(previewItem)}
                        onClose={() => setPreviewItem(null)}
                        onUpdateImage={handleUpdateImage}
                    />
                )}
                {Object.entries(groupedItems).map(([category, catItems]) => (
                    <Accordion
                        key={category}
                        title={t(`categories.${getCatKey(category)}`) || category}
                        count={catItems.filter(i => selectedIds.has(i.id)).length}
                        defaultOpen={true}
                    >
                        <div className="catalog-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                            gap: '0.75rem'
                        }}>
                            {catItems.map(item => (
                                <CatalogCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIds.has(item.id)}
                                    onToggle={onToggle}
                                    onPreview={() => setPreviewItem(item)}
                                    imageUrl={getProductImage(item)}
                                />
                            ))}
                        </div>
                    </Accordion>
                ))}

                {filteredItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>{t('no_items', { name: searchTerm }) || `No items found for "${searchTerm}"`}</p>
                    </div>
                )}

                {!isExactMatchFound && (
                    <button
                        onClick={() => onAddCustom(searchTerm)}
                        className="add-custom-btn"
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: '2px dashed var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'transparent',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <Plus size={20} />
                        <span>{t('add_custom', { name: searchTerm }) || `Add "${searchTerm}" to list`}</span>
                    </button>
                )}
            </div>
        );
    }

    // CATEGORY VIEW (GRID OR EXPANDED)
    return (
        <div className="catalog-container">
            {previewItem && (
                <ImagePreviewModal
                    item={previewItem}
                    imageUrl={getProductImage(previewItem)}
                    onClose={() => setPreviewItem(null)}
                    onUpdateImage={handleUpdateImage}
                />
            )}

            {!expandedCategory ? (
                <>
                    {/* Top Level Favorites Section */}
                    {!searchTerm && favoriteItems.length > 0 && (
                        <div className="favorites-section" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Star className="text-primary" size={20} fill="var(--primary)" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                                    {t('freq_used') || 'Frequently Used'}
                                </h3>
                            </div>
                            <div className="favorites-scroll-container" style={{
                                display: 'grid',
                                gridAutoFlow: 'column',
                                gridAutoColumns: '120px',
                                gap: '0.75rem',
                                overflowX: 'auto',
                                paddingBottom: '0.75rem',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch'
                            }}>
                                {favoriteItems.map(item => (
                                    <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                                        <CatalogCard
                                            item={item}
                                            isSelected={selectedIds.has(item.id)}
                                            onToggle={onToggle}
                                            onPreview={() => setPreviewItem(item)}
                                            imageUrl={getProductImage(item)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 600 }}>{t('catalog_categories') || 'Browse by Category'}</h3>
                    <div className="category-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '1rem'
                    }}>

                        {categories.map(cat => {
                            const catItems = groupedItems[cat];
                            const selectedInCat = catItems.filter(i => selectedIds.has(i.id)).length;
                            const emoji = cat.split(' ').pop();
                            const nameOnly = cat.replace(/[^\x00-\x7F]/g, '').trim();

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setExpandedCategory(cat)}
                                    className="category-card"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '1.25rem',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        gap: '0.75rem',
                                        position: 'relative',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ fontSize: '2.5rem' }}>{emoji}</div>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>
                                        {t(`categories.${nameOnly}`) || nameOnly}
                                    </span>
                                    {selectedInCat > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: 'var(--primary)', color: 'white',
                                            fontSize: '0.75rem', padding: '2px 6px',
                                            borderRadius: 'var(--radius-full)', fontWeight: 700
                                        }}>
                                            {selectedInCat}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="expanded-category fade-in">
                    {/* Header with Navigation */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border)',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--bg-main)',
                        zIndex: 10
                    }}>
                        <button
                            onClick={() => setExpandedCategory(null)}
                            className="btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-main)',
                                minWidth: '80px'
                            }}
                        >
                            ← {t('back') || 'Back'}
                        </button>

                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                                {expandedCategory === 'Favorites' ? (t('freq_used') || 'Favorites') : (t(`categories.${getCatKey(expandedCategory)}`) || expandedCategory)}
                            </h2>
                        </div>

                        {expandedCategory !== 'Favorites' && (
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button
                                    onClick={() => handleNav('prev')}
                                    className="btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    ← {t('prev') || 'Prev'}
                                </button>
                                <button
                                    onClick={() => handleNav('next')}
                                    className="btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {t('next') || 'Next'} →
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="catalog-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {(expandedCategory === 'Favorites' ? favoriteItems : groupedItems[expandedCategory]).map(item => (
                            <CatalogCard
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onToggle={onToggle}
                                onPreview={() => setPreviewItem(item)}
                                imageUrl={getProductImage(item)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .category-grid {
                    animation: slideUp 0.3s ease-out;
                }
                .category-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-4px);
                    border-color: var(--primary);
                }
                .category-card:active {
                    transform: scale(0.95);
                }
                .favorites {
                    border: 2px solid var(--primary) !important;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .favorites-scroll-container::-webkit-scrollbar {
                    height: 6px;
                }
                .favorites-scroll-container::-webkit-scrollbar-track {
                    background: var(--bg-surface);
                    border-radius: 10px;
                }
                .favorites-scroll-container::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }
                .favorites-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: var(--primary);
                }
                
                @media (min-width: 768px) {
                    .favorites-scroll-container {
                        grid-auto-flow: unset !important;
                        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)) !important;
                        overflow-x: visible !important;
                    }
                }
            `}</style>
        </div>
    );
}

function CatalogCard({ item, isSelected, onToggle, onPreview, imageUrl }) {
    const Icon = getIconForProduct(item.name);
    const { t } = useTranslation();
    const longPressTimer = useRef(null);

    const handleStart = () => {
        longPressTimer.current = setTimeout(() => {
            onPreview();
        }, 600);
    };

    const handleEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    return (
        <button
            onClick={() => onToggle(item)}
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            onContextMenu={(e) => {
                e.preventDefault();
                onPreview();
            }}
            className={`catalog-card ${isSelected ? 'selected' : ''}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '0.5rem',
                position: 'relative',
                height: '100%',
                minHeight: '130px',
                userSelect: 'none'
            }}
        >
            <div
                className="icon-wrapper"
                style={{
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s'
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                        loading="lazy"
                    />
                ) : (
                    <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <Icon size={32} />
                    </div>
                )}
            </div>

            <span style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                textAlign: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.2,
                color: 'var(--text-main)'
            }}>
                {t(item.name)}
            </span>

            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    <Check size={12} strokeWidth={3} />
                </div>
            )}
        </button>
    );
}

function ImagePreviewModal({ item, imageUrl, onClose, onUpdateImage }) {
    const { t } = useTranslation();
    const [editMode, setEditMode] = useState(false);
    const [customUrl, setCustomUrl] = useState('');

    const handleSaveUrl = () => {
        if (customUrl) {
            onUpdateImage(item.id, customUrl);
            setEditMode(false);
            onClose();
        }
    };

    const handleUseIcon = () => {
        onUpdateImage(item.id, 'USE_ICON');
        setEditMode(false);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '1rem',
                maxWidth: '400px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <X size={24} />
                </button>

                <h3 style={{ fontSize: '1.25rem', textAlign: 'center', marginTop: '0.5rem' }}>{t(item.name)}</h3>

                {/* Image Area */}
                <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: '#f0f0f0',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ color: 'gray', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ImageIcon size={48} />
                            <span>No Image</span>
                        </div>
                    )}
                </div>

                {/* Fix Actions */}
                {!editMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {t('wrong_image') || "Wrong image?"}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setEditMode(true)} className="btn" style={{ flex: 1, border: '1px solid var(--border)' }}>
                                Fix Image
                            </button>
                            <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
                                {t('close') || "OK"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Fix Mismatched Image:</p>
                        <input
                            type="text"
                            placeholder="Paste Image URL..."
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                        />
                        <button onClick={handleSaveUrl} className="btn btn-primary" disabled={!customUrl}>
                            Save New Image
                        </button>
                        <button onClick={handleUseIcon} className="btn" style={{ border: '1px solid var(--border)' }}>
                            Remove Image (Use Icon)
                        </button>
                        <button onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', textDecoration: 'underline', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
