package com.pattakelu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "liked_songs")
@IdClass(LikedSong.LikedSongId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikedSong {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "song_id")
    private UUID songId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", insertable = false, updatable = false)
    private Song song;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LikedSongId implements Serializable {
        private UUID userId;
        private UUID songId;
    }
}
