package com.pattakelu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "listening_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListeningHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @Column(name = "duration_played", nullable = false)
    private Integer durationPlayed;

    @Builder.Default
    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "device_info")
    private String deviceInfo;

    @CreationTimestamp
    @Column(name = "played_at", nullable = false, updatable = false)
    private Instant playedAt;
}
