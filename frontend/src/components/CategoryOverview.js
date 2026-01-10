import React from 'react';

function CategoryOverview({ category, onNavigate }) {
    // Filter out the 'overview' item itself from the list to avoid recursion/redundancy
    const tools = category.items.filter(item => !item.id.includes('overview'));

    return (
        <div className="tab-container">
            <div className="tab-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '2.5rem' }}>{category.icon}</span>
                    <h2 style={{ margin: 0 }}>{category.title}</h2>
                </div>
                <p>
                    Explore {category.title.toLowerCase()} sources. Select a tool below to get started.
                </p>
            </div>

            <div className="feature-grid">
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        className="feature-card"
                        onClick={() => onNavigate(tool.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h3>
                            <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>
                                {tool.icon}
                            </span>
                            {tool.label}
                        </h3>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            Access real-time data and analytics from {tool.label}.
                        </p>
                        <div style={{ marginTop: 'auto' }}>
                            <button className="fetch-btn" style={{ width: '100%' }}>
                                Launch Tool
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoryOverview;
