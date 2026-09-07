package com.pattakelu.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PlayEventRequest {
    @NotNull
    private UUID songId;

    @Min(0)
    private Integer durationPlayed;

    private Boolean completed;
    private String deviceInfo;
}
