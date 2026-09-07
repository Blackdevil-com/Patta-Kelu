package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtistResponse {
    private UUID id;
    private String name;
    private String bio;
    private String profileImageUrl;
    private String coverImageUrl;
    private Long monthlyListeners;
    private Boolean verified;
    private boolean isFollowed;
}
