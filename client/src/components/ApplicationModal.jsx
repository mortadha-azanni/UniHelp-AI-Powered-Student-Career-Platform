import { useState, useEffect } from 'react';
import { createApplication, updateApplication } from '../api/jobApplicationsApi';

const ApplicationModal = ({ application, cvVersions, onClose }) => {
    const isEdit = !!application;
    const [formData, setFormData] = useState({
        company: '',
        position: '',
        location: '',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        cvVersion: '',
        jobDescription: '',
        applicationUrl: '',
        notes: '',
        salary: { min: '', max: '', currency: 'EUR' },
        jobType: 'Full-Time'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (application) {
            setFormData({
                company: application.company || '',
                position: application.position || '',
                location: application.location || '',
                applicationDate: application.applicationDate ? new Date(application.applicationDate).toISOString().split('T')[0] : '',
                status: application.status || 'Applied',
                cvVersion: application.cvVersion?._id || '',
                jobDescription: application.jobDescription || '',
                applicationUrl: application.applicationUrl || '',
                notes: application.notes || '',
                salary: application.salary || { min: '', max: '', currency: 'EUR' },
                jobType: application.jobType || 'Full-Time'
            });
        }
    }, [application]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('salary.')) {
            const salaryField = name.split('.')[1];
            setFormData({
                ...formData,
                salary: { ...formData.salary, [salaryField]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.company.trim() || !formData.position.trim() || !formData.jobDescription.trim()) {
            alert('Veuillez remplir l\'entreprise, le poste et la description du poste');
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                ...formData
            };

            if (isEdit) {
                await updateApplication(application._id, submitData);
            } else {
                await createApplication(submitData);
            }

            onClose(true);
        } catch (error) {
            console.error('Error saving application:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? 'Modifier' : 'Nouvelle'} Candidature</h2>
                    <button className="close-btn" onClick={() => onClose(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="company">Entreprise *</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    required
                                    placeholder="Google, Microsoft..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="position">Poste *</label>
                                <input
                                    type="text"
                                    id="position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    required
                                    placeholder="Développeur Full Stack..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Localisation</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Paris, Remote..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="applicationDate">Date de candidature</label>
                                <input
                                    type="date"
                                    id="applicationDate"
                                    name="applicationDate"
                                    value={formData.applicationDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Statut</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Applied">Candidature Envoyée</option>
                                    <option value="Interview">Entretien</option>
                                    <option value="Offer">Offre Reçue</option>
                                    <option value="Rejected">Refusée</option>
                                    <option value="Withdrawn">Retirée</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="cvVersion">Version du CV</label>
                                <select
                                    id="cvVersion"
                                    name="cvVersion"
                                    value={formData.cvVersion}
                                    onChange={handleChange}
                                >
                                    <option value="">Aucune</option>
                                    {cvVersions.map(cv => (
                                        <option key={cv._id} value={cv._id}>
                                            {cv.versionName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="jobType">Type de travail</label>
                                <select
                                    id="jobType"
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                >
                                    <option value="Internship">Stage</option>
                                    <option value="Full-Time">Temps plein</option>
                                    <option value="Part-Time">Temps partiel</option>
                                    <option value="Contract">Contrat</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="applicationUrl">Lien de candidature</label>
                                <input
                                    type="url"
                                    id="applicationUrl"
                                    name="applicationUrl"
                                    value={formData.applicationUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="jobDescription">
                                Description du poste *
                                <span className="hint">Décrivez les responsabilités et exigences du poste</span>
                            </label>
                            <textarea
                                id="jobDescription"
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleChange}
                                rows="5"
                                required
                                placeholder="Ex: Nous recherchons un développeur Full-Stack avec une expérience en React.js, Node.js et MongoDB. Vous serez responsable du développement de nouvelles fonctionnalités..."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Informations complémentaires..."
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="salary.min">Salaire min (optionnel)</label>
                                <input
                                    type="number"
                                    id="salary.min"
                                    name="salary.min"
                                    value={formData.salary.min}
                                    onChange={handleChange}
                                    placeholder="40000"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="salary.max">Salaire max (optionnel)</label>
                                <input
                                    type="number"
                                    id="salary.max"
                                    name="salary.max"
                                    value={formData.salary.max}
                                    onChange={handleChange}
                                    placeholder="60000"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="salary.currency">Devise</label>
                                <select
                                    id="salary.currency"
                                    name="salary.currency"
                                    value={formData.salary.currency}
                                    onChange={handleChange}
                                >
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onClose(false)}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;
