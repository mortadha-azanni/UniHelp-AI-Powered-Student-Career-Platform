const InterviewList = ({ applications, cvVersions }) => {
    // Filter only applications with Interview status
    const interviewApplications = applications.filter(app => app.status === 'Interview');

    if (interviewApplications.length === 0) {
        return (
            <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h3>Aucun entretien programmé</h3>
                <p>Les candidatures avec statut "Entretien" apparaîtront ici</p>
            </div>
        );
    }

    return (
        <div className="interview-list">
            <div className="interview-list-header">
                <h3>📅 Entretiens à préparer</h3>
                <span className="interview-count">{interviewApplications.length} entretien{interviewApplications.length > 1 ? 's' : ''}</span>
            </div>

            <div className="interview-items">
                {interviewApplications.map(app => {
                    const cvVersion = cvVersions.find(cv => cv._id === app.cvVersion?._id);

                    return (
                        <div key={app._id} className="interview-item">
                            <div className="interview-main-info">
                                <div className="interview-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    </svg>
                                </div>
                                <div className="interview-details">
                                    <h4 className="interview-position">{app.position}</h4>
                                    <p className="interview-company">{app.company}</p>
                                    {app.location && (
                                        <p className="interview-location">📍 {app.location}</p>
                                    )}
                                </div>
                            </div>

                            <div className="interview-metadata">
                                {cvVersion ? (
                                    <div className="cv-info">
                                        <span className="cv-label">CV utilisé:</span>
                                        <span className="cv-name">📄 {cvVersion.versionName}</span>
                                    </div>
                                ) : (
                                    <div className="cv-info">
                                        <span className="cv-warning">⚠️ Aucun CV associé</span>
                                    </div>
                                )}

                                <div className="interview-date">
                                    <span className="date-label">Candidature:</span>
                                    <span className="date-value">
                                        {new Date(app.applicationDate).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="interview-actions">
                                <button
                                    className="btn-prep-interview"
                                    onClick={() => {
                                        // À implémenter plus tard
                                        alert('Préparation d\'entretien - À venir !');
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    Préparer l'entretien
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InterviewList;
