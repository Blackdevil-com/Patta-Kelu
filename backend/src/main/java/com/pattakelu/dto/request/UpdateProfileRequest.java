package com.pattakelu.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    @Size(max = 100)
    private String displayName;
    private String bio;
    private String country;
    private LocalDate dateOfBirth;
    private String profileImageUrl;
}
