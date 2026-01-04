import { useMemo } from 'react';
import { getIconForProduct } from '../utils/icons';
import { Accordion } from './Accordion';
import { Plus, Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import all product images eagerly
const productImages = import.meta.glob('../assets/products/*.{png,jpg,jpeg,webp}', { eager: true });

export function CatalogGrid({ items, selectedIds, searchTerm, onToggle, onAddCustom }) {
    const { t } = useTranslation();

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
        console.log('Lookup path:', path);
        console.log('Available keys:', Object.keys(productImages));
        return productImages[path]?.default;
    };

    return (
        <div className="catalog-container">

            {/* Top Products Section (Simulated for now, could be dynamic) */}
            {!searchTerm && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={18} fill="orange" stroke="orange" /> Frequently Used
                    </h3>
                    <div className="scroll-row" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {items.slice(0, 5).map(item => (
                            <CatalogCard
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onToggle={onToggle}
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
                    title={category}
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
                                imageUrl={getProductImage(item.image)}
                            />
                        ))}
                    </div>
                </Accordion>
            ))}

            {/* Empty State */}
            {filteredItems.length === 0 && searchTerm && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No items found for "{searchTerm}"</p>
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
                    <span>Add "{searchTerm}" to list</span>
                </button>
            )}
        </div>
    );
}

function CatalogCard({ item, isSelected, onToggle, imageUrl }) {
    const Icon = getIconForProduct(item.name);

    return (
        <button
            onClick={() => onToggle(item)}
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
                minHeight: '130px'
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
