package com.pattakelu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "followed_artists")
@IdClass(FollowedArtist.FollowedArtistId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowedArtist {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "artist_id")
    private UUID artistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", insertable = false, updatable = false)
    private Artist artist;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowedArtistId implements Serializable {
        private UUID userId;
        private UUID artistId;
    }
}
