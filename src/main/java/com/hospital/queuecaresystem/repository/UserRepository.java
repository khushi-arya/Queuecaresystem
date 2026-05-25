package com.hospital.queuecaresystem.repository;

import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    /**
     * Find all users with pagination and role filtering
     */
    Page<User> findByRole(Role role, Pageable pageable);
    
    /**
     * Get all users with pagination
     */
    @Override
    Page<User> findAll(Pageable pageable);
    
    /**
     * Count users by role
     */
    long countByRole(Role role);
}
