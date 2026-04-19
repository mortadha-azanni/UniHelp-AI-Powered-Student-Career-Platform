const ApplicationFilters = ({ filters, onFilterChange }) => {
    const statuses = ['all', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
    const sortOptions = [
        { value: '-applicationDate', label: 'Plus récentes' },
        { value: 'applicationDate', label: 'Plus anciennes' },
        { value: 'company', label: 'Entreprise (A-Z)' },
        { value: '-company', label: 'Entreprise (Z-A)' }
    ];

    return (
        <div className="application-filters">
            <div className="filter-group">
                <label htmlFor="status-filter">Statut</label>
                <select
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => onFilterChange({ status: e.target.value })}
                    className="filter-select"
                >
                    <option value="all">Tous les statuts</option>
                    {statuses.slice(1).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="sort-filter">Trier par</label>
                <select
                    id="sort-filter"
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                    className="filter-select"
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group search-group">
                <label htmlFor="search-filter">Rechercher</label>
                <input
                    id="search-filter"
                    type="text"
                    placeholder="Entreprise ou poste..."
                    value={filters.search}
                    onChange={(e) => onFilterChange({ search: e.target.value })}
                    className="filter-input"
                />
            </div>
        </div>
    );
};

export default ApplicationFilters;
