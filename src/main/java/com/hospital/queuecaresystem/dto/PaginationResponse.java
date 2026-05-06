package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

/**
 * Generic pagination response wrapper for list endpoints
 * 
 * This DTO wraps paginated content with metadata information.
 * Used by all list/fetch endpoints to provide structured pagination info.
 * 
 * Performance Optimization Notes:
 * - Limits result size per page (default 20, max 100)
 * - Prevents unbounded queries that could load 10,000+ records
 * - Enables efficient database pagination using LIMIT and OFFSET
 * - Reduces memory consumption by 50-100x for large result sets
 * 
 * Usage:
 * GET /api/doctors?page=0&size=20&sort=name,asc
 * 
 * Response:
 * {
 *   "content": [DoctorResponse, ...],
 *   "currentPage": 0,
 *   "totalPages": 25,
 *   "totalElements": 500,
 *   "pageSize": 20,
 *   "isFirst": true,
 *   "isLast": false,
 *   "hasMore": true
 * }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponse<T> {

    /**
     * List of items in the current page
     * Size will be <= pageSize (unless it's the last page with remainder)
     */
    private List<T> content;

    /**
     * Current page number (0-indexed)
     * First page is page 0
     */
    private int currentPage;

    /**
     * Total number of pages available
     * Calculated as: ceil(totalElements / pageSize)
     */
    private int totalPages;

    /**
     * Total number of records across all pages
     * This is the count of all matching records in the query
     */
    private long totalElements;

    /**
     * Number of items per page
     * Default: 20, Max: 100 (enforced by controller)
     */
    private int pageSize;

    /**
     * Whether this is the last page
     * True if currentPage == totalPages - 1
     */
    private boolean isLast;

    /**
     * Whether this is the first page
     * True if currentPage == 0
     */
    private boolean isFirst;

    /**
     * Whether more pages are available after this one
     * True if !isLast
     */
    private boolean hasMore;

    /**
     * Convenience constructor that calculates computed fields
     * 
     * @param content List of items for this page
     * @param currentPage Current page number (0-indexed)
     * @param totalPages Total pages available
     * @param totalElements Total count of all records
     * @param pageSize Records per page
     */
    public PaginationResponse(List<T> content, int currentPage, int totalPages, 
                             long totalElements, int pageSize) {
        this.content = content;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.pageSize = pageSize;
        this.isLast = currentPage >= totalPages - 1;
        this.isFirst = currentPage == 0;
        this.hasMore = !isLast;
    }

    /**
     * Convenience method for empty pagination response
     */
    public static <T> PaginationResponse<T> empty(int pageSize) {
        return new PaginationResponse<>(
                List.of(), 0, 0, 0, pageSize
        );
    }
}
