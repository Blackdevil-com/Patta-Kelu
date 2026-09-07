package com.pattakelu.repository;

import com.pattakelu.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlbumRepository extends JpaRepository<Album, UUID> {
    List<Album> findByArtistId(UUID artistId);

    @Query("SELECT a FROM Album a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Album> searchAlbums(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM Album a ORDER BY a.releaseDate DESC")
    List<Album> findRecentReleases(Pageable pageable);
}
