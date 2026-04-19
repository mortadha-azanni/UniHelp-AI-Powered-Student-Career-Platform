const ApplicationStats = ({ stats }) => {
    if (!stats) return null;

    const total = stats.total || 0;
    const byStatus = stats.byStatus || {};
    const successRate = stats.successRate || 0;
    const interviewRate = stats.interviewRate || 0;

    const statCards = [
        {
            label: 'Total Candidatures',
            value: total,
            icon: '📊',
            color: 'blue'
        },
        {
            label: 'Entretiens',
            value: byStatus.Interview || 0,
            icon: '🎯',
            color: 'orange'
        },
        {
            label: 'Offres Reçues',
            value: byStatus.Offer || 0,
            icon: '🎉',
            color: 'green'
        },
        {
            label: 'Taux de Réussite',
            value: `${successRate}%`,
            icon: '📈',
            color: 'purple'
        }
    ];

    return (
        <div className="application-stats">
            {statCards.map((stat, index) => (
                <div key={index} className={`stat-card stat-${stat.color}`}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stat.value}</h3>
                        <p className="stat-label">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApplicationStats;
