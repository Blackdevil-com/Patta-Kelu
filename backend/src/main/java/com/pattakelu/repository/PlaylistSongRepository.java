package com.pattakelu.repository;

import com.pattakelu.entity.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    Optional<PlaylistSong> findByPlaylistIdAndSongId(UUID playlistId, UUID songId);
    void deleteByPlaylistIdAndSongId(UUID playlistId, UUID songId);
    void deleteBySongId(UUID songId);
}
