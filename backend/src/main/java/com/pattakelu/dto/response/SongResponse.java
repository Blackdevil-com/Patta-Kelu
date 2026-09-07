package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongResponse {
    private UUID id;
    private String title;
    private UUID artistId;
    private String artistName;
    private UUID albumId;
    private String albumTitle;
    private Integer duration;
    private String coverImageUrl;
    private String streamUrl;
    private Integer trackNumber;
    private LocalDate releaseDate;
    private Long playCount;
    private Boolean explicit;
    private boolean isLiked;
    private List<String> genres;
}
