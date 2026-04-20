export interface PaginatedQuery {
    pageNumber: number;
    pageSize: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
    patientId?: string;
    doctorId?: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
