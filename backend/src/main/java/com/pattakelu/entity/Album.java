package com.pattakelu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "albums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Column(nullable = false)
    private String title;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Builder.Default
    @Column(name = "album_type", nullable = false, length = 32)
    private String albumType = "ALBUM";

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Builder.Default
    @Column(name = "total_tracks", nullable = false)
    private Integer totalTracks = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
