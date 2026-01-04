import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { getIconForProduct } from '../utils/icons';

export function SimpleList({ items, onAdd, onToggle, onDelete }) {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        onAdd(inputValue.trim());
        setInputValue('');
    };

    return (
        <div className="simple-list">
            {/* Input Section - Hidden on Print */}
            <form onSubmit={handleSubmit} className="add-item-form no-print">
                <div className="input-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        className="form-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t('add_item_placeholder')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-main)'
                        }}
                    />
                    <button type="submit" className="btn btn-primary">
                        <Plus size={20} />
                    </button>
                </div>
            </form>

            {/* List Items */}
            <ul className="list-items" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(item => {
                    const Icon = getIconForProduct(item.name);
                    return (
                        <li
                            key={item.id}
                            className={`list-item ${item.checked ? 'checked' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-md)',
                                opacity: item.checked ? 0.6 : 1,
                                border: '1px solid var(--border)'
                            }}
                        >
                            <div
                                className="item-content"
                                onClick={() => onToggle(item.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, cursor: 'pointer' }}
                            >
                                <div
                                    className="checkbox"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: `2px solid ${item.checked ? 'var(--success)' : 'var(--text-muted)'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: item.checked ? 'var(--success)' : 'transparent',
                                        color: 'white'
                                    }}
                                >
                                    {item.checked && <Check size={14} />}
                                </div>

                                <span className="icon" style={{ color: 'var(--primary)' }}>
                                    <Icon size={20} />
                                </span>

                                <span
                                    className="text"
                                    style={{
                                        textDecoration: item.checked ? 'line-through' : 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    {item.name}
                                </span>
                            </div>

                            <button
                                onClick={() => onDelete(item.id)}
                                className="btn-icon delete-btn no-print"
                                style={{ color: 'var(--danger)' }}
                                aria-label="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    );
                })}
            </ul>

            {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p>List is empty</p>
                </div>
            )}
        </div>
    );
}
