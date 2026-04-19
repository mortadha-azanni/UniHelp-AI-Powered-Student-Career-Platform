import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApplications, getApplicationStats, exportApplications } from '../api/jobApplicationsApi';
import { getCVs } from '../api/cvsApi';
import { getTodos } from '../api/todosApi';
import ApplicationsTable from '../components/ApplicationsTable';
import ApplicationStats from '../components/ApplicationStats';
import TodoWidget from '../components/TodoWidget';
import ApplicationModal from '../components/ApplicationModal';
import RoadmapAnalyticsWidget from '../components/RoadmapAnalyticsWidget';

const DashboardHome = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [cvVersions, setCvVersions] = useState([]);
    const [stats, setStats] = useState(null);
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [appsData, statsData, cvsData, todosData] = await Promise.all([
                getApplications({ status: 'all', sortBy: '-applicationDate' }),
                getApplicationStats(),
                getCVs(),
                getTodos({ status: 'all' })
            ]);

            setApplications(appsData.data || []);
            setStats(statsData.data || {});
            setCvVersions(cvsData.data || []);
            setTodos(todosData.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddApplication = () => {
        setSelectedApplication(null);
        setShowModal(true);
    };

    const handleModalClose = (shouldRefresh) => {
        setShowModal(false);
        setSelectedApplication(null);
        if (shouldRefresh) {
            loadData();
        }
    };

    const handleExport = async () => {
        try {
            await exportApplications();
        } catch (error) {
            console.error('Error exporting applications:', error);
        }
    };

    const handleEditApplication = (application) => {
        setSelectedApplication(application);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement du tableau de bord...</p>
            </div>
        );
    }

    return (
        <div className="job-applications-page">
            <div className="page-header">
                <div>
                    <h1>Bienvenue, {user?.username} ! 👋</h1>
                    <p className="subtitle">Tableau de bord de suivi des candidatures</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Exporter
                    </button>
                    <button className="btn btn-primary" onClick={handleAddApplication}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nouvelle Candidature
                    </button>
                </div>
            </div>

            <ApplicationStats stats={stats} />

            <div className="applications-content">
                <div className="applications-main">
                    <ApplicationsTable
                        applications={applications}
                        cvVersions={cvVersions}
                        onEdit={handleEditApplication}
                        onRefresh={loadData}
                    />
                </div>

                <aside className="applications-sidebar">
                    <TodoWidget todos={todos} onRefresh={loadData} />
                    <RoadmapAnalyticsWidget />
                </aside>
            </div>

            {showModal && (
                <ApplicationModal
                    application={selectedApplication}
                    cvVersions={cvVersions}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default DashboardHome;
