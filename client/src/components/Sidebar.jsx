import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';

const Sidebar = () => {
    const [gamification, setGamification] = useState({ xp: 0, level: 1 });

    useEffect(() => {
        const fetchGamification = async () => {
            try {
                const { data } = await api.get('/gamification');
                if (data?.success) {
                    setGamification(data.data);
                }
            } catch (error) {
                console.error("Gamification fetch error:", error);
            }
        };
        fetchGamification();
    }, []);

    const navItems = [
        {
            name: 'Accueil',
            path: '/dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            )
        },
        {
            name: 'Mon Profil',
            path: '/dashboard/profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
        {
            name: 'Générer CV',
            path: '/dashboard/generate-cv',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            )
        },
        {
            name: 'Critiquer mon Profile',
            path: '/dashboard/profile-critique',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
            )
        },
        {
            name: 'Préparation Entretien',
            path: '/dashboard/interview-prep',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            )
        },
        {
            name: 'Mes Roadmaps',
            path: '/dashboard/roadmaps',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                    <line x1="9" y1="3" x2="9" y2="18"></line>
                    <line x1="15" y1="6" x2="15" y2="21"></line>
                </svg>
            )
        },
        {
            name: 'Communauté',
            path: '/dashboard/community-roadmaps',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            )
        }
    ];

    // Progress to next level logic
    const levelThreshold = 100;
    const currentLevelXP = gamification.xp % levelThreshold;
    const progressPercentage = (currentLevelXP / levelThreshold) * 100;

    return (
        <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="sidebar-brand">
                <h2>CV Builder</h2>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            isActive ? 'nav-item active' : 'nav-item'
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ margin: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>Niveau {gamification.level}</span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>{gamification.xp} XP total</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercentage}%`, backgroundColor: '#3b82f6', height: '100%', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '0.25rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                    {levelThreshold - currentLevelXP} XP restants
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
