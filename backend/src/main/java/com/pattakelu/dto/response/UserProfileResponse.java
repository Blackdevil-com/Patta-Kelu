package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String username;
    private String displayName;
    private String profileImageUrl;
    private String bio;
    private String country;
    private LocalDate dateOfBirth;
    private boolean emailVerified;
    private List<String> roles;
    private Instant createdAt;
}
