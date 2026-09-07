package com.pattakelu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "songs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    @Column(nullable = false)
    private Integer duration; // in seconds

    @Column(name = "audio_file_key", nullable = false, length = 512)
    private String audioFileKey;

    @Builder.Default
    @Column(name = "audio_format", nullable = false, length = 32)
    private String audioFormat = "audio/mpeg";

    @Builder.Default
    @Column(name = "audio_size_bytes", nullable = false)
    private Long audioSizeBytes = 0L;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Builder.Default
    @Column(name = "track_number")
    private Integer trackNumber = 1;

    @Builder.Default
    @Column(name = "disc_number")
    private Integer discNumber = 1;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Builder.Default
    @Column(name = "play_count", nullable = false)
    private Long playCount = 0L;

    @Column(columnDefinition = "TEXT")
    private String lyrics;

    @Builder.Default
    @Column(nullable = false)
    private Boolean explicit = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "song_genres",
            joinColumns = @JoinColumn(name = "song_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();
}
