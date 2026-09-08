package com.pattakelu.service;

import com.pattakelu.dto.request.CreatePlaylistRequest;
import com.pattakelu.dto.request.UpdatePlaylistRequest;
import com.pattakelu.dto.response.PagedResponse;
import com.pattakelu.dto.response.PlaylistResponse;
import com.pattakelu.dto.response.SongResponse;
import com.pattakelu.entity.Playlist;
import com.pattakelu.entity.PlaylistSong;
import com.pattakelu.entity.Song;
import com.pattakelu.entity.User;
import com.pattakelu.exception.ForbiddenException;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.mapper.CatalogMapper;
import com.pattakelu.mapper.PlaylistMapper;
import com.pattakelu.repository.LikedSongRepository;
import com.pattakelu.repository.PlaylistRepository;
import com.pattakelu.repository.PlaylistSongRepository;
import com.pattakelu.repository.SongRepository;
import com.pattakelu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final LikedSongRepository likedSongRepository;
    private final PlaylistMapper playlistMapper;
    private final CatalogMapper catalogMapper;
    private final com.pattakelu.storage.StorageService storageService;

    @Transactional(readOnly = true)
    public PagedResponse<PlaylistResponse> getUserPlaylists(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Playlist> playlists = playlistRepository.findByUserId(userId, pageable);
        List<PlaylistResponse> responses = playlists.getContent().stream()
                .map(playlistMapper::toPlaylistResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(playlists, responses);
    }

    @Transactional
    public PlaylistResponse createPlaylist(UUID userId, CreatePlaylistRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Playlist playlist = Playlist.builder()
                .user(user)
                .name(request.getName().trim())
                .description(request.getDescription())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .coverImageUrl(request.getCoverImageUrl())
                .playlistSongs(new ArrayList<>())
                .build();

        playlist = playlistRepository.save(playlist);
        return playlistMapper.toPlaylistResponse(playlist);
    }

    @Transactional(readOnly = true)
    public PlaylistResponse getPlaylistById(UUID playlistId, UUID currentUserId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        // IDOR Defense: If playlist is private, verify ownership
        if (!Boolean.TRUE.equals(playlist.getIsPublic())) {
            if (currentUserId == null || !playlist.getUser().getId().equals(currentUserId)) {
                throw new ForbiddenException("This playlist is private");
            }
        }

        PlaylistResponse response = playlistMapper.toPlaylistResponse(playlist);
        List<SongResponse> trackResponses = playlist.getPlaylistSongs().stream()
                .map(ps -> {
                    SongResponse sr = catalogMapper.toSongResponse(ps.getSong());
                    if (currentUserId != null) {
                        sr.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, ps.getSong().getId()));
                    }
                    return sr;
                })
                .collect(Collectors.toList());

        response.setTracks(trackResponses);
        return response;
    }

    @Transactional
    public PlaylistResponse updatePlaylist(UUID playlistId, UUID currentUserId, UpdatePlaylistRequest request) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        if (!playlist.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to modify this playlist");
        }

        playlist.setName(request.getName().trim());
        if (request.getDescription() != null) playlist.setDescription(request.getDescription());
        if (request.getIsPublic() != null) playlist.setIsPublic(request.getIsPublic());
        if (request.getCoverImageUrl() != null) playlist.setCoverImageUrl(request.getCoverImageUrl());

        playlist = playlistRepository.save(playlist);
        return playlistMapper.toPlaylistResponse(playlist);
    }

    @Transactional
    public PlaylistResponse uploadPlaylistCover(UUID playlistId, UUID currentUserId, org.springframework.web.multipart.MultipartFile coverFile) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        if (!playlist.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to modify this playlist");
        }

        if (coverFile == null || coverFile.isEmpty()) {
            throw new com.pattakelu.exception.BadRequestException("Cover image file is required");
        }

        String fileName = storageService.storeFile(coverFile, "images");
        playlist.setCoverImageUrl(storageService.getPublicUrl(fileName));
        playlist = playlistRepository.save(playlist);
        return playlistMapper.toPlaylistResponse(playlist);
    }

    @Transactional
    public void deletePlaylist(UUID playlistId, UUID currentUserId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        if (!playlist.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to delete this playlist");
        }

        playlistRepository.delete(playlist);
    }

    @Transactional
    public void addSongToPlaylist(UUID playlistId, UUID songId, UUID currentUserId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        if (!playlist.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to modify this playlist");
        }

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found"));

        if (playlistSongRepository.findByPlaylistIdAndSongId(playlistId, songId).isEmpty()) {
            int nextPosition = playlist.getPlaylistSongs().size() + 1;
            PlaylistSong playlistSong = PlaylistSong.builder()
                    .playlist(playlist)
                    .song(song)
                    .position(nextPosition)
                    .build();
            playlistSongRepository.save(playlistSong);
        }
    }

    @Transactional
    public void removeSongFromPlaylist(UUID playlistId, UUID songId, UUID currentUserId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        if (!playlist.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to modify this playlist");
        }

        playlistSongRepository.deleteByPlaylistIdAndSongId(playlistId, songId);
    }
}
