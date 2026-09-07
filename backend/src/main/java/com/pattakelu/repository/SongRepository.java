package com.pattakelu.repository;

import com.pattakelu.entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SongRepository extends JpaRepository<Song, UUID> {
    List<Song> findByArtistId(UUID artistId);
    List<Song> findByAlbumIdOrderByTrackNumberAsc(UUID albumId);

    @Query("SELECT s FROM Song s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Song> searchSongs(@Param("query") String query, Pageable pageable);

    @Query("SELECT s FROM Song s ORDER BY s.playCount DESC")
    List<Song> findTrendingSongs(Pageable pageable);

    @Query("SELECT s FROM Song s ORDER BY s.releaseDate DESC NULLS LAST, s.createdAt DESC")
    List<Song> findNewReleases(Pageable pageable);

    @Query("SELECT s FROM Song s JOIN s.genres g WHERE g.id = :genreId ORDER BY s.playCount DESC")
    List<Song> findByGenreId(@Param("genreId") Long genreId, Pageable pageable);

    @Modifying
    @Query("UPDATE Song s SET s.playCount = s.playCount + 1 WHERE s.id = :songId")
    void incrementPlayCount(@Param("songId") UUID songId);
}
