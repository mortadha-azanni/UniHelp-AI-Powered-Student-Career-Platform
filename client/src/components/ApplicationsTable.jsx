import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateApplicationStatus, deleteApplication } from '../api/jobApplicationsApi';

const ApplicationsTable = ({ applications, cvVersions, onRefresh, onEdit }) => {
    const navigate = useNavigate();
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [viewingCV, setViewingCV] = useState(null);

    const getJobTypeLabel = (jobType) => {
        const labels = {
            'Internship': 'Stage',
            'Full-Time': 'Temps plein',
            'Part-Time': 'Temps partiel',
            'Contract': 'Contrat',
            'Freelance': 'Freelance'
        };
        return labels[jobType] || jobType;
    };

    const getStatusColor = (status) => {
        const colors = {
            'Applied': '#3b82f6',
            'Interview': '#f59e0b',
            'Offer': '#10b981',
            'Rejected': '#ef4444',
            'Withdrawn': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [applicationId]: true }));
        try {
            await updateApplicationStatus(applicationId, { status: newStatus });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [applicationId]: false }));
        }
    };

    const handleDelete = async (applicationId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
            try {
                await deleteApplication(applicationId);
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Error deleting application:', error);
                alert('Erreur lors de la suppression de la candidature');
            }
        }
    };

    const handleViewCV = (cvVersion) => {
        if (!cvVersion) {
            alert('Aucun CV associé à cette candidature');
            return;
        }
        setViewingCV(cvVersion);
    };

    const closeCV = () => {
        setViewingCV(null);
    };

    if (!applications || applications.length === 0) {
        return (
            <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h3>Aucune candidature</h3>
                <p>Commencez par créer votre première candidature</p>
            </div>
        );
    }

    return (
        <>
            <div className="applications-table-container">
                <div className="applications-table-header">
                    <h3>📋 Mes Candidatures</h3>
                    <span className="applications-count">{applications.length} candidature{applications.length > 1 ? 's' : ''}</span>
                </div>

                <div className="table-wrapper">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Entreprise</th>
                                <th>Poste</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Date</th>
                                <th>CV</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => {
                                // Use the populated cvVersion directly from the application
                                const cvVersion = app.cvVersion;

                                return (
                                    <tr key={app._id}>
                                        <td className="company-cell">
                                            <strong>{app.company}</strong>
                                            {app.location && (
                                                <div className="location-tag">📍 {app.location}</div>
                                            )}
                                        </td>
                                        <td>{app.position}</td>
                                        <td>
                                            <span className="job-type-badge">
                                                {getJobTypeLabel(app.jobType)}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="status-select"
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                disabled={updatingStatus[app._id]}
                                                style={{ borderLeft: `3px solid ${getStatusColor(app.status)}` }}
                                            >
                                                <option value="Applied">Candidature Envoyée</option>
                                                <option value="Interview">Entretien</option>
                                                <option value="Offer">Offre Reçue</option>
                                                <option value="Rejected">Refusée</option>
                                                <option value="Withdrawn">Retirée</option>
                                            </select>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(app.applicationDate).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="cv-cell">
                                            {cvVersion ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn-view-cv"
                                                        onClick={() => handleViewCV(cvVersion)}
                                                        title="Voir le code LaTeX"
                                                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                                    >
                                                        📄 Voir LaTeX
                                                    </button>
                                                    <button
                                                        className="btn-overleaf"
                                                        onClick={() => {
                                                            try {
                                                                const base64 = btoa(unescape(encodeURIComponent(cvVersion.latexCode)));
                                                                const dataUri = 'data:text/x-tex;base64,' + base64;
                                                                const overleafUrl = 'https://www.overleaf.com/docs?snip_uri=' + encodeURIComponent(dataUri);

                                                                // Check if URL is too long (most servers limit to ~8KB for URLs)
                                                                if (overleafUrl.length > 8000) {
                                                                    // Fallback: Download the .tex file instead
                                                                    const blob = new Blob([cvVersion.latexCode], { type: 'text/plain' });
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.href = url;
                                                                    a.download = `${cvVersion.versionName || 'cv'}.tex`;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    document.body.removeChild(a);
                                                                    window.URL.revokeObjectURL(url);

                                                                    alert('⚠️ Le CV est trop volumineux pour être ouvert directement.\n\n' +
                                                                        '📥 Le fichier .tex a été téléchargé.\n\n' +
                                                                        '📝 Pour utiliser Overleaf:\n' +
                                                                        '1. Allez sur overleaf.com\n' +
                                                                        '2. Créez un nouveau projet\n' +
                                                                        '3. Uploadez le fichier .tex téléchargé');
                                                                } else {
                                                                    window.open(overleafUrl, '_blank');
                                                                }
                                                            } catch (e) {
                                                                console.error('Error opening Overleaf:', e);
                                                                alert('Impossible d\'ouvrir Overleaf avec ce contenu.');
                                                            }
                                                        }}
                                                        title="Ouvrir dans Overleaf"
                                                        style={{
                                                            fontSize: '0.85rem',
                                                            padding: '0.4rem 0.8rem',
                                                            backgroundColor: '#4CAF50',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                                                        onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                                    >
                                                        🚀 Overleaf
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="no-cv">-</span>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-edit"
                                                    onClick={() => onEdit(app)}
                                                    title="Modifier"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDelete(app._id)}
                                                    title="Supprimer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CV Viewer Modal */}
            {viewingCV && (
                <div className="modal-overlay" onClick={closeCV}>
                    <div className="modal-container cv-viewer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📄 {viewingCV.versionName}</h2>
                            <button className="close-btn" onClick={closeCV}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body cv-content-viewer">
                            <div className="cv-meta-info">
                                <p><strong>Généré le:</strong> {new Date(viewingCV.generatedDate).toLocaleDateString('fr-FR')}</p>
                                {viewingCV.description && <p><strong>Description:</strong> {viewingCV.description}</p>}
                            </div>

                            {viewingCV.latexCode ? (
                                <>
                                    <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Code LaTeX</h3>
                                    <div style={{
                                        backgroundColor: '#1e293b',
                                        color: '#e2e8f0',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        overflowX: 'auto',
                                        maxHeight: '400px',
                                        border: '1px solid #334155',
                                        fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                                        fontSize: '0.85rem',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.5'
                                    }}>
                                        {viewingCV.latexCode}
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    <p>Aucun code LaTeX disponible pour ce CV.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    try {
                                        const base64 = btoa(unescape(encodeURIComponent(viewingCV.latexCode)));
                                        const dataUri = 'data:text/x-tex;base64,' + base64;
                                        const overleafUrl = 'https://www.overleaf.com/docs?snip_uri=' + encodeURIComponent(dataUri);

                                        // Check if URL is too long (most servers limit to ~8KB for URLs)
                                        if (overleafUrl.length > 8000) {
                                            // Fallback: Download the .tex file instead
                                            const blob = new Blob([viewingCV.latexCode], { type: 'text/plain' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${viewingCV.versionName || 'cv'}.tex`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            window.URL.revokeObjectURL(url);

                                            alert('⚠️ Le CV est trop volumineux pour être ouvert directement.\n\n' +
                                                '📥 Le fichier .tex a été téléchargé.\n\n' +
                                                '📝 Pour utiliser Overleaf:\n' +
                                                '1. Allez sur overleaf.com\n' +
                                                '2. Créez un nouveau projet\n' +
                                                '3. Uploadez le fichier .tex téléchargé');
                                        } else {
                                            window.open(overleafUrl, '_blank');
                                        }
                                    } catch (e) {
                                        console.error('Error opening Overleaf:', e);
                                        alert('Impossible d\'ouvrir Overleaf avec ce contenu.');
                                    }
                                }}
                                style={{ marginRight: '0.5rem' }}
                            >
                                🚀 Ouvrir dans Overleaf
                            </button>
                            <button className="btn btn-secondary" onClick={closeCV}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApplicationsTable;
