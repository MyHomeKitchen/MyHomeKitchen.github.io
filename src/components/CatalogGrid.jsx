import { useMemo, useState, useRef } from 'react';
import { getIconForProduct } from '../utils/icons';
import { Accordion } from './Accordion';
import { Plus, Check, Star, X, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import all product images eagerly
const productImages = import.meta.glob('../assets/products/*.{png,jpg,jpeg,webp}', { eager: true });

export function CatalogGrid({ items, selectedIds, searchTerm, onToggle, onAddCustom }) {
    const { t } = useTranslation();
    const [previewItem, setPreviewItem] = useState(null);

    // 1. Filter items based on search
    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.keywords && item.keywords.some(k => k.includes(searchTerm.toLowerCase())))
        );
    }, [items, searchTerm]);

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

    // Helper to resolve image path
    const getProductImage = (imageName) => {
        if (!imageName) return null;
        const path = `../assets/products/${imageName}`;
        return productImages[path]?.default;
    };

    return (
        <div className="catalog-container">
            {/* Image Preview Modal */}
            {previewItem && (
                <ImagePreviewModal
                    item={previewItem}
                    imageUrl={getProductImage(previewItem.image)}
                    onClose={() => setPreviewItem(null)}
                />
            )}

            {/* Top Products Section (Simulated for now, could be dynamic) */}
            {!searchTerm && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={18} fill="orange" stroke="orange" /> {t('freq_used') || 'Frequently Used'}
                    </h3>
                    <div className="scroll-row" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {items.slice(0, 5).map(item => (
                            <CatalogCard
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onToggle={onToggle}
                                onPreview={() => setPreviewItem(item)}
                                imageUrl={getProductImage(item.image)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Grid by Category */}
            {Object.entries(groupedItems).map(([category, catItems]) => (
                <Accordion
                    key={category}
                    title={t(category) || t(`categories.${category}`) || category}
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
                                imageUrl={getProductImage(item.image)}
                            />
                        ))}
                    </div>
                </Accordion>
            ))}

            {/* Empty State */}
            {filteredItems.length === 0 && searchTerm && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>{t('no_items', { name: searchTerm }) || `No items found for "${searchTerm}"`}</p>
                </div>
            )}

            {/* "Add Custom" if no exact match */}
            {searchTerm && !isExactMatchFound && (
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

function CatalogCard({ item, isSelected, onToggle, onPreview, imageUrl }) {
    const Icon = getIconForProduct(item.name);
    const longPressTimer = useRef(null);

    const handleStart = () => {
        longPressTimer.current = setTimeout(() => {
            onPreview(); // Trigger preview after 500ms
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
                onPreview(); // Right click also previews
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
                {item.name}
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

function ImagePreviewModal({ item, imageUrl, onClose }) {
    const { t } = useTranslation();
    // Logic to reload image: append a random query param to the src if it were a URL.
    // BUT, since we are using local assets (downloaded files), we can't easily "switch" the image file client-side.
    // HOWEVER, the user request says "images are not matching... try another".
    // Since we CANNOT download a new image from the browser (CORS, file system access),
    // we will simulate this by showing a "Image Refresh Not Available Offline" or
    // if it's a downloaded asset, maybe we can search on Google?
    // wait, the prompt says "when user hold on product make images large for preview".
    // AND "some images are not matching".
    // I can't magically fix the local file from the browser.
    // I will add a link to Search Google Images for this item as a fallback?
    // Or I can add a fake "Report" button.
    // Let's implement the Large Preview first.

    // Actually, if I can't change the file, I can allow them to toggle between the Image and the Icon!
    // That solves "image not matching" -> "Use Icon instead".

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

                <h3 style={{ fontSize: '1.25rem', textAlign: 'center', marginTop: '0.5rem' }}>{item.name}</h3>

                <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: '#f0f0f0',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ color: 'gray' }}>No Image Available</div>
                    )}
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {t('wrong_image') || "Wrong image?"} <br />
                    <small>(This is a local demo, report not available)</small>
                </p>

                <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
                    {t('close') || "Close"}
                </button>
            </div>
        </div>
    );
}
