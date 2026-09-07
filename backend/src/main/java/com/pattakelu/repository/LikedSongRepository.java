package com.pattakelu.repository;

import com.pattakelu.entity.LikedSong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LikedSongRepository extends JpaRepository<LikedSong, LikedSong.LikedSongId> {
    Optional<LikedSong> findByUserIdAndSongId(UUID userId, UUID songId);
    boolean existsByUserIdAndSongId(UUID userId, UUID songId);
    void deleteByUserIdAndSongId(UUID userId, UUID songId);

    @Query("SELECT l.song FROM LikedSong l WHERE l.userId = :userId ORDER BY l.createdAt DESC")
    Page<com.pattakelu.entity.Song> findLikedSongsByUserId(@Param("userId") UUID userId, Pageable pageable);
}
