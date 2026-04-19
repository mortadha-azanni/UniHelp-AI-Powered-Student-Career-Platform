import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getRoadmaps } from '../api/roadmapService';

const COLORS = {
    'Master': '#10b981', // green
    'Advanced': '#3b82f6', // blue
    'Intermediate': '#f59e0b', // orange
    'Beginner': '#cbd5e1', // gray
    'Non Évalué': '#f1f5f9' // light gray
};

const RoadmapAnalyticsWidget = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndComputeStats = async () => {
            try {
                const roadmaps = await getRoadmaps();

                const masteryCounts = {
                    'Master': 0,
                    'Advanced': 0,
                    'Intermediate': 0,
                    'Beginner': 0,
                    'Non Évalué': 0
                };

                let totalNodesAnalyzed = 0;

                roadmaps.forEach(roadmap => {
                    (roadmap.nodes || []).forEach(node => {
                        const level = node.data?.masteryLevel || 'Non Évalué';
                        if (masteryCounts[level] !== undefined) {
                            masteryCounts[level]++;
                        } else {
                            masteryCounts['Non Évalué']++;
                        }
                        totalNodesAnalyzed++;
                    });
                });

                const chartData = Object.keys(masteryCounts)
                    .filter(key => masteryCounts[key] > 0)
                    .map(key => ({
                        name: key,
                        value: masteryCounts[key]
                    }));

                setStats(chartData);
            } catch (error) {
                console.error("Error computing roadmap analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndComputeStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des statistiques...</div>;
    }

    if (stats.length === 0) {
        return (
            <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Analyse des Compétences 📊</h3>
                <p style={{ color: '#64748b' }}>Aucune donnée de roadmap trouvée.</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Répartition des niveaux de maîtrise (Roadmaps IA) 🧠</h3>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Non Évalué']} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Compétences']} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RoadmapAnalyticsWidget;
