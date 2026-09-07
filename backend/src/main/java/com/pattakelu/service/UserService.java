package com.pattakelu.service;

import com.pattakelu.dto.request.UpdateProfileRequest;
import com.pattakelu.dto.response.UserProfileResponse;
import com.pattakelu.entity.User;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.mapper.UserMapper;
import com.pattakelu.repository.UserRepository;
import com.pattakelu.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    private final StorageService storageService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

        user = userRepository.save(user);
        return userMapper.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse uploadProfileImage(UUID userId, org.springframework.web.multipart.MultipartFile imageFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (imageFile == null || imageFile.isEmpty()) {
            throw new com.pattakelu.exception.BadRequestException("Image file is required");
        }

        String fileName = storageService.storeFile(imageFile, "images");
        String imageUrl = "/uploads/" + fileName;
        user.setProfileImageUrl(imageUrl);

        user = userRepository.save(user);
        return userMapper.toProfileResponse(user);
    }
}
