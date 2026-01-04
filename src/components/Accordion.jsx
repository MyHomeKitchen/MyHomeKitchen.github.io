import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function Accordion({ title, children, defaultOpen = false, count = 0 }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            marginBottom: '1rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-surface)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--text-main)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <span>{title}</span>
                    {count > 0 && (
                        <span style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)'
                        }}>
                            {count}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div style={{ padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
