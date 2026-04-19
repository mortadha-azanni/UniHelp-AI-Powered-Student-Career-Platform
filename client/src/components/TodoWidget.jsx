import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTodo, toggleTodoStatus, deleteTodo } from '../api/todosApi';

const TodoWidget = ({ todos, onRefresh }) => {
    const navigate = useNavigate();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTodo, setNewTodo] = useState({
        title: '',
        category: 'Skill Gap',
        priority: 'Medium'
    });

    const activeTodos = todos.filter(t => t.status !== 'Completed');
    const completedTodos = todos.filter(t => t.status === 'Completed');

    const handleAddTodo = async (e) => {
        e.preventDefault();

        if (!newTodo.title.trim()) {
            alert('Veuillez entrer un titre');
            return;
        }

        try {
            await createTodo(newTodo);
            setNewTodo({ title: '', category: 'Skill Gap', priority: 'Medium' });
            setShowAddForm(false);
            onRefresh();
        } catch (error) {
            console.error('Error creating todo:', error);
            alert('Erreur lors de la création de la tâche');
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleTodoStatus(id);
            onRefresh();
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette tâche ?')) {
            try {
                await deleteTodo(id);
                onRefresh();
            } catch (error) {
                console.error('Error deleting todo:', error);
            }
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Skill Gap': '🎓',
            'Learning Objective': '📚',
            'Application Follow-up': '📧',
            'General': '📝'
        };
        return icons[category] || '📝';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': 'red',
            'Medium': 'orange',
            'Low': 'green'
        };
        return colors[priority] || 'gray';
    };

    return (
        <div className="todo-widget">
            <div className="widget-header">
                <h3>
                    <span>📋</span>
                    Objectifs & Tâches
                </h3>
                <button
                    className="icon-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                    title="Ajouter une tâche"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            {showAddForm && (
                <form className="todo-form" onSubmit={handleAddTodo}>
                    <input
                        type="text"
                        placeholder="Titre de la tâche..."
                        value={newTodo.title}
                        onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                        className="todo-input"
                    />
                    <div className="form-row">
                        <select
                            value={newTodo.category}
                            onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                            className="todo-select"
                        >
                            <option value="Skill Gap">Compétence manquante</option>
                            <option value="Learning Objective">Objectif d'apprentissage</option>
                            <option value="Application Follow-up">Suivi candidature</option>
                            <option value="General">Général</option>
                        </select>
                        <select
                            value={newTodo.priority}
                            onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                            className="todo-select"
                        >
                            <option value="High">Haute</option>
                            <option value="Medium">Moyenne</option>
                            <option value="Low">Basse</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-sm btn-secondary" onClick={() => setShowAddForm(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-sm btn-primary">
                            Ajouter
                        </button>
                    </div>
                </form>
            )}

            <div className="todo-list">
                {activeTodos.length === 0 && completedTodos.length === 0 ? (
                    <p className="empty-message">Aucune tâche pour le moment</p>
                ) : (
                    <>
                        {activeTodos.map(todo => (
                            <div key={todo._id} className="todo-item">
                                <div className="todo-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        onChange={() => handleToggle(todo._id)}
                                    />
                                </div>
                                <div className="todo-content">
                                    <div className="todo-title">
                                        <span className="category-icon">{getCategoryIcon(todo.category)}</span>
                                        {todo.title}
                                    </div>
                                    {todo.relatedSkill && (
                                        <p className="todo-skill">Compétence: {todo.relatedSkill}</p>
                                    )}
                                    <div className="todo-meta">
                                        <span className={`priority-badge priority-${getPriorityColor(todo.priority)}`}>
                                            {todo.priority}
                                        </span>
                                        {todo.progress > 0 && (
                                            <span className="progress-text">{todo.progress}%</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="icon-btn"
                                        title="Créer une Roadmap pour cette tâche"
                                        onClick={() => {
                                            const searchParams = new URLSearchParams();
                                            searchParams.set('todoObjective', todo.title);
                                            navigate(`/dashboard/roadmaps?${searchParams.toString()}`);
                                        }}
                                        style={{ color: '#8b5cf6' }}
                                    >
                                        🗺️
                                    </button>
                                    <button
                                        className="icon-btn delete"
                                        onClick={() => handleDelete(todo._id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {completedTodos.length > 0 && (
                            <>
                                <div className="completed-divider">
                                    <span>✓ Terminées ({completedTodos.length})</span>
                                </div>
                                {completedTodos.map(todo => (
                                    <div key={todo._id} className="todo-item completed">
                                        <div className="todo-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                onChange={() => handleToggle(todo._id)}
                                            />
                                        </div>
                                        <div className="todo-content">
                                            <div className="todo-title">
                                                <span className="category-icon">{getCategoryIcon(todo.category)}</span>
                                                {todo.title}
                                            </div>
                                        </div>
                                        <button
                                            className="icon-btn delete"
                                            onClick={() => handleDelete(todo._id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>

            <div className="widget-footer">
                <p className="stats-text">
                    {activeTodos.length} active{activeTodos.length !== 1 ? 's' : ''} • {completedTodos.length} terminée{completedTodos.length !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
};

export default TodoWidget;
