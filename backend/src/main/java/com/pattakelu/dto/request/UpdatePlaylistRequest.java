package com.pattakelu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePlaylistRequest {

    @NotBlank(message = "Playlist name is required")
    @Size(max = 255)
    private String name;

    private String description;
    private Boolean isPublic;
    private String coverImageUrl;
}
