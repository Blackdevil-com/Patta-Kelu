package com.pattakelu.repository;

import com.pattakelu.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {
    Page<Playlist> findByUserId(UUID userId, Pageable pageable);
    Page<Playlist> findByIsPublicTrue(Pageable pageable);

    @Query("SELECT p FROM Playlist p WHERE p.isPublic = true AND LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Playlist> searchPublicPlaylists(@Param("query") String query, Pageable pageable);
}
