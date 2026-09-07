package com.pattakelu.repository;

import com.pattakelu.entity.FollowedArtist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FollowedArtistRepository extends JpaRepository<FollowedArtist, FollowedArtist.FollowedArtistId> {
    Optional<FollowedArtist> findByUserIdAndArtistId(UUID userId, UUID artistId);
    boolean existsByUserIdAndArtistId(UUID userId, UUID artistId);
    void deleteByUserIdAndArtistId(UUID userId, UUID artistId);

    @Query("SELECT f.artist FROM FollowedArtist f WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    Page<com.pattakelu.entity.Artist> findFollowedArtistsByUserId(@Param("userId") UUID userId, Pageable pageable);
}
