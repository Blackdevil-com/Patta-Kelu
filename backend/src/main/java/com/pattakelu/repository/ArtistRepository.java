package com.pattakelu.repository;

import com.pattakelu.entity.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, UUID> {
    @Query("SELECT a FROM Artist a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Artist> searchArtists(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM Artist a ORDER BY a.monthlyListeners DESC")
    List<Artist> findTopArtists(Pageable pageable);
}
