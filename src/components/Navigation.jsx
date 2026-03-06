import React from 'react';
// Removed react-router-dom

const Navigation = ({ activeSection }) => {
    const links = [
        { id: "home", label: "홈" },
        { id: "about", label: "인물" },
        { id: "numbers", label: "넘버" },
        { id: "creators", label: "스태프" },
        { id: "bts", label: "연습실" },
        { id: "game", label: "미니게임" },
    ];

    return (
        <nav className="nav-container">
            {links.map((link) => {
                return (
                    <div
                        key={link.id}
                        onClick={() => {
                            const el = document.getElementById(link.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`nav-item ${activeSection === link.id ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                    >
                        {link.label}
                    </div>
                );
            })}
        </nav>
    );
};

export default Navigation;
