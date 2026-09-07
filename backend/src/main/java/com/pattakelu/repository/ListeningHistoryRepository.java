package com.pattakelu.repository;

import com.pattakelu.entity.ListeningHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {
    Page<ListeningHistory> findByUserIdOrderByPlayedAtDesc(UUID userId, Pageable pageable);
    void deleteBySongId(UUID songId);
}
