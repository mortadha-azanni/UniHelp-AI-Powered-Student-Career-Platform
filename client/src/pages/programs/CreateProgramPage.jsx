// ─── CreateProgramPage ────────────────────────────────────────────────────
import React from 'react';
import AssistantChat from '../../components/programs/create/AssistantChat';
import ProgramPreview from '../../components/programs/create/ProgramPreview';

const MOCK_DRAFT = {
    title: "React Complet – Du Débutant à l'Expert",
    description:
        "Un programme structuré pour maîtriser React de zéro jusqu'à un niveau avancé, incluant les patterns modernes, la gestion d'état, les tests et même React Native pour le mobile.",
    category: 'Frontend',
    level: 'Intermédiaire',
    duration: '15 semaines',
    modules: [
        { id: 'm1', title: 'Fondations React & JSX', duration: '2h 30min', taskCount: 4 },
        { id: 'm2', title: "Gestion d'état & Hooks", duration: '3h 00min', taskCount: 5 },
        { id: 'm3', title: 'Patterns Avancés', duration: '3h 30min', taskCount: 4 },
        { id: 'm4', title: 'Performance & Optimisation', duration: '2h 45min', taskCount: 4 },
        { id: 'm5', title: 'Tests avec Vitest & Testing Lib', duration: '3h 00min', taskCount: 4 },
        { id: 'm6', title: 'React Native & Expo', duration: '4h 00min', taskCount: 5 },
    ],
};

const STEPS = ['Décrire', 'Réviser', 'Publier'];

const CreateProgramPage = () => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1.5rem', animation: 'fadeInUp 0.45s ease both' }}>
        {/* Header */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
            <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 0.25rem', lineHeight: 1.2 }}>
                    Créer un Programme
                </h1>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Décrivez votre objectif, l'IA génère votre plan d'apprentissage
                </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                {STEPS.map((step, i) => (
                    <React.Fragment key={step}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: i === 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                                border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.68rem', fontWeight: '700',
                                color: i === 0 ? '#fff' : 'var(--text-tertiary)',
                                boxShadow: i === 0 ? '0 2px 10px rgba(99,102,241,0.4)' : 'none',
                            }}>
                                {i + 1}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: i === 0 ? '700' : '500', color: i === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                                {step}
                            </span>
                        </div>
                        {i < 2 && <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* Two-column body */}
        <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flex: '0 0 55%', minWidth: 0, overflow: 'hidden' }}>
                <AssistantChat />
            </div>
            <div style={{ flex: '0 0 calc(45% - 1.5rem)', minWidth: 0, overflowY: 'auto', paddingBottom: '1rem' }}>
                <ProgramPreview draft={MOCK_DRAFT} />
            </div>
        </div>
    </div>
);

export default CreateProgramPage;
