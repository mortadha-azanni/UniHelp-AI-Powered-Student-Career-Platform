import { useState, useEffect } from 'react';
import api from '../api/axios';
import { saveGeneratedCV, draftEmail as getDraft, sendEmail as submitEmail } from '../api/cvsApi';
import { BusyTexRunner, XeLatex } from 'texlyre-busytex';

const GenerateCVPage = () => {
    const [jobApplications, setJobApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [generatedCV, setGeneratedCV] = useState(null);
    const [error, setError] = useState(null);
    const [cvName, setCvName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(null);

    // Phase 3: Email & LaTeX State
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', body: '', cvId: null });
    const [isDrafting, setIsDrafting] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState({ type: null, message: '' });
    
    // BusyTex Runner
    const [busyTexRunner, setBusyTexRunner] = useState(null);
    const [isBusyTexReady, setIsBusyTexReady] = useState(false);
    const [compilationLog, setCompilationLog] = useState('');

    // Initialize BusyTex
    useEffect(() => {
        const initBusyTex = async () => {
            try {
                const runner = new BusyTexRunner({ 
                    busytexBasePath: '/texlyre/busytex' 
                });
                await runner.initialize(true); // true for Web Worker
                setBusyTexRunner(runner);
                setIsBusyTexReady(true);
            } catch (err) {
                console.error('Failed to initialize BusyTex:', err);
            }
        };
        initBusyTex();
    }, []);

    // Fetch job applications on mount
    useEffect(() => {
        const fetchJobApplications = async () => {
            try {
                const response = await api.get('/job-applications');
                // The API returns { success: true, count: N, data: [...] }
                // So we need to access response.data.data to get the array
                setJobApplications(response.data.data || []);
            } catch (err) {
                console.error('Error fetching job applications:', err);
                setError('Impossible de charger les candidatures. Veuillez réessayer.');
            } finally {
                setLoadingApplications(false);
            }
        };

        fetchJobApplications();
    }, []);

    const handleGenerateCV = async () => {
        if (!selectedApplicationId) {
            setError('Veuillez sélectionner une candidature.');
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedCV(null);
        setSaveSuccess(null);

        try {
            const response = await api.post('/cvs/generate', { jobApplicationId: selectedApplicationId });
            if (response.data.success) {
                setGeneratedCV(response.data.latex);

                // Auto-populate CV name based on selected application
                const selectedApp = jobApplications.find(app => app._id === selectedApplicationId);
                if (selectedApp) {
                    setCvName(`CV ${selectedApp.company} - ${selectedApp.position}`);
                }
            } else {
                setError('Erreur lors de la génération du CV.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la communication avec le serveur.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndAttach = async () => {
        if (!cvName.trim()) {
            setError('Veuillez entrer un nom pour le CV.');
            return;
        }

        setSaving(true);
        setError(null);
        setSaveSuccess(null);

        try {
            const response = await saveGeneratedCV({
                versionName: cvName,
                latexCode: generatedCV,
                jobApplicationId: selectedApplicationId
            });

            if (response.success) {
                // Get the selected application details for the success message
                const selectedApp = jobApplications.find(app => app._id === selectedApplicationId);
                const companyInfo = selectedApp ? ` pour ${selectedApp.company} - ${selectedApp.position}` : '';
                setSaveSuccess(`CV sauvegardé et attaché à la candidature${companyInfo} avec succès! 🎉`);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde du CV.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveOnly = async () => {
        if (!cvName.trim()) {
            setError('Veuillez entrer un nom pour le CV.');
            return;
        }

        setSaving(true);
        setError(null);
        setSaveSuccess(null);

        try {
            const response = await saveGeneratedCV({
                versionName: cvName,
                latexCode: generatedCV
            });

            if (response.success) {
                setSaveSuccess('CV sauvegardé avec succès! 🎉');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde du CV.');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setGeneratedCV(null);
        setCvName('');
        setSaveSuccess(null);
        setError(null);
    };

    const handlePrepareEmail = async () => {
        if (!generatedCV) return;
        
        setIsDrafting(true);
        setError(null);
        setEmailStatus({ type: null, message: '' }); // Clear previous status

        try {
            // 1. Ensure CV is saved first to get an ID
            const saveResponse = await saveGeneratedCV({
                versionName: cvName || 'CV Candidature',
                latexCode: generatedCV,
                jobApplicationId: selectedApplicationId
            });
            
            if (!saveResponse.success) {
                throw new Error("Impossible de sauvegarder le CV avant le brouillon.");
            }
            
            const currentCvId = saveResponse.data.cv._id;

            // 2. Get AI Draft from backend
            const response = await getDraft({
                cvId: currentCvId,
                jobApplicationId: selectedApplicationId
            });

            if (response.success) {
                setEmailDraft({
                    to: '',
                    subject: response.data.subject,
                    body: response.data.body,
                    cvId: currentCvId
                });
                setIsEmailModalOpen(true);
            }
        } catch (err) {
            console.error("Preparation Error:", err);
            const msg = err.response?.data?.message || err.message || "Erreur lors de la préparation de l'email.";
            setError(msg);
            setEmailStatus({ type: 'error', message: msg });
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSendFinalEmail = async (e) => {
        e.preventDefault();
        if (!busyTexRunner) {
            setEmailStatus({ type: 'error', message: "Le compilateur PDF n'est pas encore prêt. Veuillez patienter." });
            return;
        }

        setIsSendingEmail(true);
        setEmailStatus({ type: null, message: '' }); // Clear status when starting

        try {
            // 3. Client-side LaTeX compilation
            console.log("Starting PDF compilation with BusyTex...");
            const xelatex = new XeLatex(busyTexRunner);
            
            // Log the LaTeX code length and first few lines for debugging
            console.log("LaTeX Input Length:", generatedCV.length);
            
            const compileResult = await xelatex.compile({ 
                input: generatedCV,
                options: ['-interaction=nonstopmode'] // Ensure it doesn't hang on errors
            });
            
            setCompilationLog(compileResult.log || '');

            if (!compileResult.success || !compileResult.pdf) {
                console.error('LaTeX compilation failed!');
                console.error('Logs:', compileResult.log);
                throw new Error("La compilation du PDF a échoué. Vérifiez la syntaxe LaTeX ou contactez le support.");
            }

            console.log("PDF compiled successfully, size:", compileResult.pdf.length, "bytes");
            const pdfBlob = new Blob([compileResult.pdf], { type: 'application/pdf' });
            
            // 4. Send via Backend
            const formData = new FormData();
            formData.append('to', emailDraft.to);
            formData.append('subject', emailDraft.subject);
            formData.append('message', emailDraft.body);
            formData.append('cvId', emailDraft.cvId);
            formData.append('cvFile', pdfBlob, `${cvName || 'CV_Candidature'}.pdf`);

            const response = await submitEmail(formData);
            if (response.success) {
                setEmailStatus({ type: 'success', message: 'Email envoyé avec succès !' });
                setTimeout(() => {
                    setIsEmailModalOpen(false);
                    setEmailStatus({ type: null, message: '' });
                }, 2000);
            } else {
                throw new Error(response.message || "Erreur lors de l'envoi de l'email.");
            }
        } catch (err) {
            console.error("Email Sending Error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Une erreur est survenue.";
            setEmailStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSendingEmail(false);
        }
    };

    const downloadTex = () => {
        if (!generatedCV) return;
        const blob = new Blob([generatedCV], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Générer un CV</h2>
                <p className="subtitle">Créez votre CV professionnel avec l'aide de l'IA</p>
            </div>

            <div className="content-card">
                <div className="cv-generator-content">
                    {/* Header Icon */}
                    <div className="generator-section">
                        {!generatedCV && (
                            <>
                                <div className="info-icon" style={{ margin: '0 auto 1.5rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Générateur de CV IA</h3>
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                    Sélectionnez une candidature pour générer un CV sur mesure.
                                </p>
                            </>
                        )}

                        {/* Input Section */}
                        <div className="input-section" style={{ width: '100%', marginBottom: '2rem' }}>
                            <label htmlFor="jobApplication" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Candidature <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            {loadingApplications ? (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chargement des candidatures...</p>
                            ) : jobApplications.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    Aucune candidature enregistrée. Veuillez d'abord créer une candidature.
                                </p>
                            ) : (
                                <select
                                    id="jobApplication"
                                    value={selectedApplicationId}
                                    onChange={(e) => setSelectedApplicationId(e.target.value)}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        backgroundColor: loading ? '#f1f5f9' : 'white',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value="">-- Sélectionnez une candidature --</option>
                                    {jobApplications.map((app) => (
                                        <option key={app._id} value={app._id}>
                                            {app.company} - {app.position} ({app.location || 'Non spécifié'})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                                <strong>Erreur:</strong> {error}
                            </div>
                        )}

                        {/* Button */}
                        {!generatedCV && (
                            <button
                                className="btn-primary"
                                onClick={handleGenerateCV}
                                disabled={loading}
                                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                        </svg>
                                        Génération du CV en cours...
                                    </span>
                                ) : (
                                    <>
                                        ✨ Générer mon CV Maintenant
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Result Section */}
                    {generatedCV && (
                        <div className="result-section" style={{ marginTop: '0', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Aperçu du Code LaTeX</h3>
                                <button
                                    onClick={() => setGeneratedCV(null)}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Générer un autre
                                </button>
                            </div>

                            <div className="preview-box" style={{
                                backgroundColor: '#1e293b',
                                color: '#e2e8f0',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                overflowX: 'auto',
                                maxHeight: '500px',
                                border: '1px solid #334155',
                                fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                                fontSize: '0.85rem',
                                whiteSpace: 'pre-wrap',
                                positions: 'relative'
                            }}>
                                {generatedCV}
                            </div>

                            {/* Success Message */}
                            {saveSuccess && (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#d1fae5',
                                    color: '#065f46',
                                    borderRadius: '8px',
                                    marginTop: '1.5rem',
                                    marginBottom: '1.5rem',
                                    border: '1px solid #6ee7b7',
                                    fontWeight: 500
                                }}>
                                    ✅ {saveSuccess}
                                </div>
                            )}

                            {/* Save CV Section */}
                            {!saveSuccess && (
                                <div style={{
                                    marginTop: '2rem',
                                    marginBottom: '2rem',
                                    padding: '1.5rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                        💾 Sauvegarder ce CV
                                    </h4>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label htmlFor="cvName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                            Nom du CV
                                        </label>
                                        <input
                                            id="cvName"
                                            type="text"
                                            value={cvName}
                                            onChange={(e) => setCvName(e.target.value)}
                                            placeholder="Ex: CV Google - Software Engineer"
                                            disabled={saving}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.95rem',
                                                fontFamily: 'inherit',
                                                backgroundColor: saving ? '#f1f5f9' : 'white'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <button
                                            className="btn-primary"
                                            onClick={handleSaveAndAttach}
                                            disabled={saving}
                                            style={{
                                                flex: '1 1 auto',
                                                minWidth: '200px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1rem'
                                            }}
                                        >
                                            {saving ? (
                                                <>
                                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                                    </svg>
                                                    Sauvegarde...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                                        <polyline points="7 3 7 8 15 8"></polyline>
                                                    </svg>
                                                    Sauvegarder et attacher à la candidature
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={handleSaveOnly}
                                            disabled={saving}
                                            style={{
                                                flex: '1 1 auto',
                                                minWidth: '150px',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '8px',
                                                border: '2px solid var(--primary-color)',
                                                backgroundColor: 'white',
                                                color: 'var(--primary-color)',
                                                fontWeight: 600,
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                fontSize: '0.95rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s',
                                                opacity: saving ? 0.6 : 1
                                            }}
                                            onMouseOver={(e) => {
                                                if (!saving) {
                                                    e.target.style.backgroundColor = 'var(--primary-color)';
                                                    e.target.style.color = 'white';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'white';
                                                e.target.style.color = 'var(--primary-color)';
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                                <polyline points="7 3 7 8 15 8"></polyline>
                                            </svg>
                                            Sauvegarder seulement
                                        </button>

                                        <button
                                            onClick={handleDiscard}
                                            disabled={saving}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '8px',
                                                border: '2px solid #ef4444',
                                                backgroundColor: 'white',
                                                color: '#ef4444',
                                                fontWeight: 600,
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                fontSize: '0.95rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s',
                                                opacity: saving ? 0.6 : 1
                                            }}
                                            onMouseOver={(e) => {
                                                if (!saving) {
                                                    e.target.style.backgroundColor = '#ef4444';
                                                    e.target.style.color = 'white';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'white';
                                                e.target.style.color = '#ef4444';
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            Rejeter
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Download Actions */}
                            <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    className="btn-primary"
                                    onClick={downloadTex}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Télécharger le fichier .tex
                                </button>

                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        try {
                                            const base64 = btoa(unescape(encodeURIComponent(generatedCV)));
                                            const dataUri = 'data:text/x-tex;base64,' + base64;
                                            const overleafUrl = 'https://www.overleaf.com/docs?snip_uri=' + encodeURIComponent(dataUri);

                                            // Check if URL is too long (most servers limit to ~8KB for URLs)
                                            if (overleafUrl.length > 8000) {
                                                // Fallback: Download the .tex file instead
                                                const blob = new Blob([generatedCV], { type: 'text/plain' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${cvName || 'cv'}.tex`;
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
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'white', color: '#333', border: '1px solid #ccc' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                    Ouvrir dans Overleaf
                                </button>

                                <button
                                    className="btn-primary"
                                    onClick={handlePrepareEmail}
                                    disabled={isDrafting || !generatedCV || !isBusyTexReady}
                                    style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '0.5rem',
                                        backgroundColor: '#4f46e5',
                                        color: 'white',
                                        opacity: (isDrafting || !generatedCV || !isBusyTexReady) ? 0.7 : 1,
                                        cursor: (isDrafting || !generatedCV || !isBusyTexReady) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isDrafting ? (
                                        <>
                                            <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                            Rédaction...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            Envoyer mail
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Email Modal */}
                            {isEmailModalOpen && (
                                <div className="modal-overlay" style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(8px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1000,
                                    padding: '1rem',
                                    animation: 'fadeIn 0.3s ease-out'
                                }}>
                                    <div className="modal-card" style={{
                                        background: 'var(--bg-card)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid var(--border-color)',
                                        padding: '2.5rem',
                                        borderRadius: '24px',
                                        width: '100%',
                                        maxHeight: '90vh',
                                        overflowY: 'auto',
                                        maxWidth: '650px',
                                        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
                                        animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                        position: 'relative'
                                    }}>
                                        <button 
                                            onClick={() => setIsEmailModalOpen(false)}
                                            style={{
                                                position: 'absolute',
                                                top: '1.5rem',
                                                right: '1.5rem',
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-tertiary)',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                                                Envoyer ma candidature
                                            </h2>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                Révisez votre message avant l'envoi final avec votre CV attaché.
                                            </p>
                                        </div>

                                        {emailStatus.message && (
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: emailStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: emailStatus.type === 'success' ? 'var(--success)' : 'var(--error)',
                                                borderRadius: '12px',
                                                marginBottom: '1.5rem',
                                                border: `1px solid ${emailStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                animation: 'fadeIn 0.3s ease-in'
                                            }}>
                                                {emailStatus.type === 'success' ? '✅' : '❌'} {emailStatus.message}
                                                {compilationLog && emailStatus.type === 'error' && (
                                                    <div style={{ marginTop: '0.5rem', width: '100%' }}>
                                                        <details>
                                                            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>Voir les logs techniques (LaTeX)</summary>
                                                            <pre style={{ 
                                                                marginTop: '0.5rem', 
                                                                padding: '0.5rem', 
                                                                backgroundColor: 'rgba(0,0,0,0.2)', 
                                                                fontSize: '0.7rem', 
                                                                maxHeight: '150px', 
                                                                overflowY: 'auto',
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-all'
                                                            }}>
                                                                {compilationLog}
                                                            </pre>
                                                        </details>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <form onSubmit={handleSendFinalEmail}>
                                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Destinataire (Email)</label>
                                                <input 
                                                    type="email" 
                                                    required
                                                    value={emailDraft.to}
                                                    onChange={e => setEmailDraft({...emailDraft, to: e.target.value})}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.875rem 1.125rem', 
                                                        borderRadius: '12px', 
                                                        border: '1px solid var(--border-color)', 
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.95rem'
                                                    }}
                                                    placeholder="recruteur@entreprise.com"
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Objet de l'email</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={emailDraft.subject}
                                                    onChange={e => setEmailDraft({...emailDraft, subject: e.target.value})}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.875rem 1.125rem', 
                                                        borderRadius: '12px', 
                                                        border: '1px solid var(--border-color)', 
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Message personnalisé</label>
                                                <textarea 
                                                    required
                                                    value={emailDraft.body}
                                                    onChange={e => setEmailDraft({...emailDraft, body: e.target.value})}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '1rem', 
                                                        borderRadius: '12px', 
                                                        border: '1px solid var(--border-color)', 
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'var(--text-primary)',
                                                        minHeight: '220px', 
                                                        fontFamily: 'inherit', 
                                                        fontSize: '0.95rem', 
                                                        lineHeight: '1.6',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            </div>
                                            
                                            <div style={{ 
                                                marginBottom: '2rem', 
                                                padding: '1rem 1.25rem', 
                                                backgroundColor: 'rgba(29, 209, 161, 0.05)', 
                                                borderRadius: '12px', 
                                                border: '1px solid var(--border-color)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '1rem' 
                                            }}>
                                                <div style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '10px', 
                                                    backgroundColor: 'rgba(29, 209, 161, 0.1)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: 'var(--accent-primary)'
                                                }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>Pièce jointe attachée</p>
                                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{cvName || 'CV_Candidature'}.pdf</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsEmailModalOpen(false)}
                                                    className="nav-item"
                                                    style={{ flex: 1, justifyContent: 'center', margin: 0 }}
                                                >
                                                    Annuler
                                                </button>
                                                <button 
                                                    type="submit"
                                                    disabled={isSendingEmail}
                                                    className="btn-primary"
                                                    style={{ 
                                                        flex: 1.5, 
                                                        margin: 0,
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {isSendingEmail ? (
                                                        <>
                                                            <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                                            {isBusyTexReady ? 'Compilation & Envoi...' : 'Initialisation...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                            </svg>
                                                            Envoyer la candidature
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Note : Le bouton "Envoyer mail" compile votre CV en PDF directement dans votre navigateur et prépare un brouillon avec l'IA.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default GenerateCVPage;