package com.pattakelu.service;

import com.pattakelu.dto.response.*;
import com.pattakelu.entity.*;
import com.pattakelu.exception.BadRequestException;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.mapper.CatalogMapper;
import com.pattakelu.mapper.UserMapper;
import com.pattakelu.repository.*;
import com.pattakelu.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;
    private final GenreRepository genreRepository;
    private final LikedSongRepository likedSongRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final StorageService storageService;
    private final CatalogMapper catalogMapper;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalArtists = artistRepository.count();
        long totalAlbums = albumRepository.count();
        long totalSongs = songRepository.count();
        long totalPlaylists = playlistRepository.count();
        long totalPlays = songRepository.findAll().stream().mapToLong(s -> s.getPlayCount() != null ? s.getPlayCount() : 0).sum();

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalArtists(totalArtists)
                .totalAlbums(totalAlbums)
                .totalSongs(totalSongs)
                .totalPlaylists(totalPlaylists)
                .totalPlays(totalPlays)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserProfileResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users = userRepository.findAll(pageable);
        List<UserProfileResponse> responses = users.getContent().stream()
                .map(userMapper::toProfileResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(users, responses);
    }

    @Transactional
    public void updateUserStatus(UUID userId, boolean enabled, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);

        AuditLog log = AuditLog.builder()
                .userId(adminUserId)
                .action(enabled ? "USER_ACTIVATED" : "USER_SUSPENDED")
                .resourceType("USER")
                .resourceId(userId.toString())
                .details("Status changed to enabled: " + enabled)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public SongResponse uploadSong(
            String title,
            String artistName,
            String albumTitle,
            String genreName,
            MultipartFile audioFile,
            MultipartFile coverImageFile,
            Integer duration,
            UUID adminUserId) {

        if (title == null || title.isBlank()) throw new BadRequestException("Song title is required");
        if (artistName == null || artistName.isBlank()) throw new BadRequestException("Artist name is required");

        // 1. Resolve or create artist
        Artist artist = artistRepository.searchArtists(artistName.trim(), PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseGet(() -> artistRepository.save(Artist.builder()
                        .name(artistName.trim())
                        .monthlyListeners(100L)
                        .verified(true)
                        .build()));

        // 2. Resolve or create album if provided
        Album album = null;
        if (albumTitle != null && !albumTitle.isBlank()) {
            album = albumRepository.searchAlbums(albumTitle.trim(), PageRequest.of(0, 1))
                    .stream().findFirst()
                    .orElseGet(() -> albumRepository.save(Album.builder()
                            .title(albumTitle.trim())
                            .artist(artist)
                            .releaseDate(LocalDate.now())
                            .build()));
        }

        // 3. Resolve genre
        Set<Genre> genres = new HashSet<>();
        if (genreName != null && !genreName.isBlank()) {
            genreRepository.findBySlug(genreName.toLowerCase().trim())
                    .ifPresent(genres::add);
        }

        // 4. Store audio file
        String audioKey = "audio/default.mp3";
        long audioSize = 0;
        if (audioFile != null && !audioFile.isEmpty()) {
            audioKey = storageService.storeFile(audioFile, "audio");
            audioSize = audioFile.getSize();
        }

        // 5. Store cover image if present
        String coverUrl = null;
        if (coverImageFile != null && !coverImageFile.isEmpty()) {
            coverUrl = "/uploads/" + storageService.storeFile(coverImageFile, "images");
        }

        Song song = Song.builder()
                .title(title.trim())
                .artist(artist)
                .album(album)
                .duration(duration != null && duration > 0 ? duration : 180)
                .audioFileKey(audioKey)
                .audioSizeBytes(audioSize)
                .audioFormat(audioFile != null && audioFile.getContentType() != null ? audioFile.getContentType() : "audio/mpeg")
                .coverImageUrl(coverUrl)
                .releaseDate(LocalDate.now())
                .genres(genres)
                .build();

        song = songRepository.save(song);

        AuditLog audit = AuditLog.builder()
                .userId(adminUserId)
                .action("SONG_UPLOADED")
                .resourceType("SONG")
                .resourceId(song.getId().toString())
                .details("Uploaded song: " + song.getTitle())
                .build();
        auditLogRepository.save(audit);

        return catalogMapper.toSongResponse(song);
    }

    @Transactional
    public void deleteSong(UUID songId, UUID adminUserId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with ID: " + songId));

        String songTitle = song.getTitle();
        String audioKey = song.getAudioFileKey();
        String coverUrl = song.getCoverImageUrl();

        // 1. Remove associations
        playlistSongRepository.deleteBySongId(songId);
        likedSongRepository.deleteByUserIdAndSongId(null, songId); // or custom query
        likedSongRepository.findAll().stream()
                .filter(ls -> ls.getSong().getId().equals(songId))
                .forEach(likedSongRepository::delete);
        listeningHistoryRepository.deleteBySongId(songId);

        // 2. Delete song entity
        songRepository.delete(song);

        // 3. Clean up stored files if custom uploaded
        if (audioKey != null && !audioKey.contains("default") && !audioKey.isBlank()) {
            try {
                storageService.deleteFile(audioKey);
            } catch (Exception ignored) {}
        }
        if (coverUrl != null && coverUrl.startsWith("/uploads/")) {
            try {
                String coverKey = coverUrl.replace("/uploads/", "");
                storageService.deleteFile(coverKey);
            } catch (Exception ignored) {}
        }

        // 4. Record audit log
        AuditLog audit = AuditLog.builder()
                .userId(adminUserId)
                .action("SONG_DELETED")
                .resourceType("SONG")
                .resourceId(songId.toString())
                .details("Admin deleted song: " + songTitle)
                .build();
        auditLogRepository.save(audit);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logs = auditLogRepository.findAll(pageable);
        return PagedResponse.of(logs);
    }
}
