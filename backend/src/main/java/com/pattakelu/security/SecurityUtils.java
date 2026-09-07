package com.pattakelu.security;

import com.pattakelu.exception.UnauthorizedException;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getAuthenticatedUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new UnauthorizedException("Full authentication is required to access this resource");
        }
        try {
            return UUID.fromString(userDetails.getUsername());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid authentication credentials");
        }
    }

    public static UUID getOptionalUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            return null;
        }
        try {
            return UUID.fromString(userDetails.getUsername());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
