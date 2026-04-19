// ─── Mock Programs Data ────────────────────────────────────────────────────

const mkTasks = (labels, doneCount) =>
    labels.map((label, i) => ({ id: String(i + 1), label, done: i < doneCount }));

export const mockPrograms = [
    {
        id: '1',
        title: 'React Avancé & Architecture',
        category: 'Frontend',
        progress: 68,
        duration: '12 semaines',
        lastUpdated: '2024-02-20',
        status: 'En cours',
        modules: [
            { id: 'm1', title: 'Rappels React & Hooks', duration: '2h 30min', progress: 100, tasks: mkTasks(['useState & useEffect', 'useRef & useMemo', 'Custom Hooks'], 3) },
            { id: 'm2', title: 'Patterns Avancés', duration: '3h 15min', progress: 80, tasks: mkTasks(['Compound Components', 'Render Props', 'HOC pattern', 'Context avancé'], 3) },
            { id: 'm3', title: 'Architecture Scalable', duration: '4h 00min', progress: 50, tasks: mkTasks(['Feature-based structure', 'Module boundaries', 'Barrel files', 'Lazy loading'], 2) },
            { id: 'm4', title: 'Performance & Optimisation', duration: '2h 45min', progress: 20, tasks: mkTasks(['React.memo', 'useMemo / useCallback', 'Profiler', 'Code splitting'], 1) },
            { id: 'm5', title: 'Tests avec Vitest', duration: '3h 00min', progress: 0, tasks: mkTasks(['Unit tests', 'Component tests', 'Mocking', 'Coverage'], 0) },
        ],
    },
    {
        id: '2',
        title: 'Node.js & API REST Professionnelle',
        category: 'Backend',
        progress: 100,
        duration: '10 semaines',
        lastUpdated: '2024-01-15',
        status: 'Terminé',
        modules: [
            { id: 'm1', title: 'Bases de Node.js', duration: '2h 00min', progress: 100, tasks: mkTasks(['Event loop', 'Modules CommonJS/ESM', 'File system'], 3) },
            { id: 'm2', title: 'Express & Routing', duration: '3h 00min', progress: 100, tasks: mkTasks(['Router setup', 'Middleware', 'Error handling', 'Static files'], 4) },
            { id: 'm3', title: 'MongoDB & Mongoose', duration: '3h 30min', progress: 100, tasks: mkTasks(['Schemas & Models', 'CRUD operations', 'Aggregation', 'Indexes'], 4) },
            { id: 'm4', title: 'Auth JWT & Sécurité', duration: '2h 30min', progress: 100, tasks: mkTasks(['JWT sign/verify', 'Refresh tokens', 'Bcrypt', 'Rate limiting'], 4) },
        ],
    },
    {
        id: '3',
        title: 'Full Stack MERN – De Zéro à Héros',
        category: 'Full Stack',
        progress: 35,
        duration: '20 semaines',
        lastUpdated: '2024-02-22',
        status: 'En cours',
        modules: [
            { id: 'm1', title: 'Fondations JavaScript', duration: '3h 00min', progress: 100, tasks: mkTasks(['ES6+', 'Async/Await', 'Destructuring', 'Modules'], 4) },
            { id: 'm2', title: 'React Fondamentaux', duration: '4h 00min', progress: 70, tasks: mkTasks(['JSX', 'Props & State', 'Events', 'Lifecycle', 'Forms'], 3) },
            { id: 'm3', title: 'Backend Express', duration: '4h 30min', progress: 30, tasks: mkTasks(['Setup projet', 'Routes CRUD', 'Auth middleware', 'Tests Postman'], 1) },
            { id: 'm4', title: 'Déploiement CI/CD', duration: '2h 00min', progress: 0, tasks: mkTasks(['GitHub Actions', 'Docker build', 'Deploy Railway', 'Variables env'], 0) },
        ],
    },
    {
        id: '4',
        title: 'DevOps & Docker pour Développeurs',
        category: 'DevOps',
        progress: 0,
        duration: '8 semaines',
        lastUpdated: '2024-02-10',
        status: 'Brouillon',
        modules: [
            { id: 'm1', title: 'Introduction Docker', duration: '2h 00min', progress: 0, tasks: mkTasks(['Containers vs VMs', 'Images & Layers', 'Dockerfile basics'], 0) },
            { id: 'm2', title: 'Docker Compose', duration: '2h 30min', progress: 0, tasks: mkTasks(['docker-compose.yml', 'Services & Networks', 'Volumes', 'Env files'], 0) },
            { id: 'm3', title: 'GitHub Actions', duration: '3h 00min', progress: 0, tasks: mkTasks(['Workflows YAML', 'CI pipeline', 'CD deployment', 'Secrets'], 0) },
        ],
    },
    {
        id: '5',
        title: 'Python & Machine Learning Fondements',
        category: 'Data Science',
        progress: 55,
        duration: '14 semaines',
        lastUpdated: '2024-02-19',
        status: 'En cours',
        modules: [
            { id: 'm1', title: 'Python pour la Data', duration: '3h 00min', progress: 100, tasks: mkTasks(['NumPy arrays', 'Pandas DataFrames', 'Matplotlib basics'], 3) },
            { id: 'm2', title: 'Machine Learning Intro', duration: '4h 00min', progress: 60, tasks: mkTasks(['Régression linéaire', 'Classification', 'K-Means', 'Validation croisée'], 2) },
            { id: 'm3', title: 'Modèles avancés', duration: '5h 00min', progress: 10, tasks: mkTasks(['Random Forest', 'SVM', 'Neural Networks intro', 'Feature engineering'], 0) },
        ],
    },
    {
        id: '6',
        title: 'React Native – Apps iOS & Android',
        category: 'Mobile',
        progress: 0,
        duration: '16 semaines',
        lastUpdated: '2024-02-05',
        status: 'Brouillon',
        modules: [
            { id: 'm1', title: 'Expo & Setup', duration: '1h 30min', progress: 0, tasks: mkTasks(['Install Expo', 'First component', 'Simulator setup'], 0) },
            { id: 'm2', title: 'Navigation', duration: '3h 00min', progress: 0, tasks: mkTasks(['Stack Navigator', 'Tab Navigator', 'Deep links', 'Params'], 0) },
            { id: 'm3', title: 'APIs Natives', duration: '4h 00min', progress: 0, tasks: mkTasks(['Camera', 'Géolocalisation', 'Push Notifications', 'AsyncStorage'], 0) },
        ],
    },
];
