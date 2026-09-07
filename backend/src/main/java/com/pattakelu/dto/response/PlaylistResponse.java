package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistResponse {
    private UUID id;
    private String name;
    private String description;
    private String coverImageUrl;
    private Boolean isPublic;
    private UUID ownerId;
    private String ownerName;
    private int trackCount;
    private Instant createdAt;
    private List<SongResponse> tracks;
}
