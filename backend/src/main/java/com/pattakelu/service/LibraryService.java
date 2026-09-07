package com.pattakelu.service;

import com.pattakelu.dto.response.ArtistResponse;
import com.pattakelu.dto.response.PagedResponse;
import com.pattakelu.dto.response.SongResponse;
import com.pattakelu.entity.*;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.mapper.CatalogMapper;
import com.pattakelu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LikedSongRepository likedSongRepository;
    private final FollowedArtistRepository followedArtistRepository;
    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final CatalogMapper catalogMapper;

    @Transactional
    public void likeSong(UUID userId, UUID songId) {
        if (!songRepository.existsById(songId)) {
            throw new ResourceNotFoundException("Song not found");
        }
        if (!likedSongRepository.existsByUserIdAndSongId(userId, songId)) {
            User user = userRepository.getReferenceById(userId);
            Song song = songRepository.getReferenceById(songId);
            LikedSong likedSong = LikedSong.builder()
                    .userId(userId)
                    .songId(songId)
                    .user(user)
                    .song(song)
                    .build();
            likedSongRepository.save(likedSong);
        }
    }

    @Transactional
    public void unlikeSong(UUID userId, UUID songId) {
        likedSongRepository.deleteByUserIdAndSongId(userId, songId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SongResponse> getLikedSongs(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Song> songs = likedSongRepository.findLikedSongsByUserId(userId, pageable);
        List<SongResponse> responses = songs.getContent().stream().map(s -> {
            SongResponse res = catalogMapper.toSongResponse(s);
            res.setLiked(true);
            return res;
        }).collect(Collectors.toList());
        return PagedResponse.of(songs, responses);
    }

    @Transactional
    public void followArtist(UUID userId, UUID artistId) {
        if (!artistRepository.existsById(artistId)) {
            throw new ResourceNotFoundException("Artist not found");
        }
        if (!followedArtistRepository.existsByUserIdAndArtistId(userId, artistId)) {
            User user = userRepository.getReferenceById(userId);
            Artist artist = artistRepository.getReferenceById(artistId);
            FollowedArtist followedArtist = FollowedArtist.builder()
                    .userId(userId)
                    .artistId(artistId)
                    .user(user)
                    .artist(artist)
                    .build();
            followedArtistRepository.save(followedArtist);
        }
    }

    @Transactional
    public void unfollowArtist(UUID userId, UUID artistId) {
        followedArtistRepository.deleteByUserIdAndArtistId(userId, artistId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ArtistResponse> getFollowedArtists(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Artist> artists = followedArtistRepository.findFollowedArtistsByUserId(userId, pageable);
        List<ArtistResponse> responses = artists.getContent().stream().map(a -> {
            ArtistResponse res = catalogMapper.toArtistResponse(a);
            res.setFollowed(true);
            return res;
        }).collect(Collectors.toList());
        return PagedResponse.of(artists, responses);
    }
}
