package com.pattakelu.service;

import com.pattakelu.dto.request.PlayEventRequest;
import com.pattakelu.dto.response.*;
import com.pattakelu.entity.*;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.mapper.CatalogMapper;
import com.pattakelu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final GenreRepository genreRepository;
    private final LikedSongRepository likedSongRepository;
    private final FollowedArtistRepository followedArtistRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final UserRepository userRepository;
    private final CatalogMapper catalogMapper;

    @Transactional(readOnly = true)
    public PagedResponse<SongResponse> getAllSongs(int page, int size, UUID currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Song> songs = songRepository.findAll(pageable);
        return mapSongsToPagedResponse(songs, currentUserId);
    }

    @Transactional(readOnly = true)
    public SongResponse getSongById(UUID id, UUID currentUserId) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with ID: " + id));
        SongResponse res = catalogMapper.toSongResponse(song);
        if (currentUserId != null) {
            res.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, song.getId()));
        }
        return res;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ArtistResponse> getAllArtists(int page, int size, UUID currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("monthlyListeners").descending());
        Page<Artist> artists = artistRepository.findAll(pageable);
        List<ArtistResponse> responses = artists.getContent().stream().map(a -> {
            ArtistResponse res = catalogMapper.toArtistResponse(a);
            if (currentUserId != null) {
                res.setFollowed(followedArtistRepository.existsByUserIdAndArtistId(currentUserId, a.getId()));
            }
            return res;
        }).collect(Collectors.toList());
        return PagedResponse.of(artists, responses);
    }

    @Transactional(readOnly = true)
    public ArtistResponse getArtistById(UUID id, UUID currentUserId) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with ID: " + id));
        ArtistResponse res = catalogMapper.toArtistResponse(artist);
        if (currentUserId != null) {
            res.setFollowed(followedArtistRepository.existsByUserIdAndArtistId(currentUserId, artist.getId()));
        }
        return res;
    }

    @Transactional(readOnly = true)
    public List<SongResponse> getArtistSongs(UUID artistId, UUID currentUserId) {
        List<Song> songs = songRepository.findByArtistId(artistId);
        return songs.stream().map(s -> {
            SongResponse res = catalogMapper.toSongResponse(s);
            if (currentUserId != null) {
                res.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, s.getId()));
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlbumResponse> getArtistAlbums(UUID artistId) {
        return albumRepository.findByArtistId(artistId).stream()
                .map(catalogMapper::toAlbumResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlbumResponse getAlbumById(UUID id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found with ID: " + id));
        return catalogMapper.toAlbumResponse(album);
    }

    @Transactional(readOnly = true)
    public List<SongResponse> getAlbumSongs(UUID albumId, UUID currentUserId) {
        List<Song> songs = songRepository.findByAlbumIdOrderByTrackNumberAsc(albumId);
        return songs.stream().map(s -> {
            SongResponse res = catalogMapper.toSongResponse(s);
            if (currentUserId != null) {
                res.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, s.getId()));
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(catalogMapper::toGenreResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void recordPlayEvent(UUID currentUserId, PlayEventRequest request) {
        Song song = songRepository.findById(request.getSongId())
                .orElseThrow(() -> new ResourceNotFoundException("Song not found"));

        songRepository.incrementPlayCount(song.getId());

        if (currentUserId != null) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user != null) {
                ListeningHistory history = ListeningHistory.builder()
                        .user(user)
                        .song(song)
                        .durationPlayed(request.getDurationPlayed() != null ? request.getDurationPlayed() : 0)
                        .completed(Boolean.TRUE.equals(request.getCompleted()))
                        .deviceInfo(request.getDeviceInfo())
                        .build();
                listeningHistoryRepository.save(history);
            }
        }
    }

    private PagedResponse<SongResponse> mapSongsToPagedResponse(Page<Song> songs, UUID currentUserId) {
        List<SongResponse> mapped = songs.getContent().stream().map(s -> {
            SongResponse res = catalogMapper.toSongResponse(s);
            if (currentUserId != null) {
                res.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, s.getId()));
            }
            return res;
        }).collect(Collectors.toList());
        return PagedResponse.of(songs, mapped);
    }
}
