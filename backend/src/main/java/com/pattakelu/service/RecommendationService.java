package com.pattakelu.service;

import com.pattakelu.dto.response.*;
import com.pattakelu.entity.Album;
import com.pattakelu.entity.Artist;
import com.pattakelu.entity.Playlist;
import com.pattakelu.entity.Song;
import com.pattakelu.mapper.CatalogMapper;
import com.pattakelu.mapper.PlaylistMapper;
import com.pattakelu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final PlaylistRepository playlistRepository;
    private final LikedSongRepository likedSongRepository;
    private final FollowedArtistRepository followedArtistRepository;
    private final CatalogMapper catalogMapper;
    private final PlaylistMapper playlistMapper;

    @Transactional(readOnly = true)
    public HomeFeedResponse getHomeFeed(UUID currentUserId) {
        PageRequest limit10 = PageRequest.of(0, 10);
        PageRequest limit6 = PageRequest.of(0, 6);

        // Trending songs
        List<SongResponse> trending = songRepository.findTrendingSongs(limit10).stream()
                .map(s -> mapSongWithLikes(s, currentUserId))
                .collect(Collectors.toList());

        // New releases
        List<SongResponse> newReleases = songRepository.findNewReleases(limit10).stream()
                .map(s -> mapSongWithLikes(s, currentUserId))
                .collect(Collectors.toList());

        // Recommendations (if user has likes, recommend based on top genre, else trending fallback)
        List<SongResponse> recommendations = trending.stream().limit(8).collect(Collectors.toList());

        // Top artists
        List<ArtistResponse> topArtists = artistRepository.findTopArtists(limit6).stream()
                .map(a -> {
                    ArtistResponse res = catalogMapper.toArtistResponse(a);
                    if (currentUserId != null) {
                        res.setFollowed(followedArtistRepository.existsByUserIdAndArtistId(currentUserId, a.getId()));
                    }
                    return res;
                })
                .collect(Collectors.toList());

        // Popular albums
        List<AlbumResponse> popularAlbums = albumRepository.findRecentReleases(limit6).stream()
                .map(catalogMapper::toAlbumResponse)
                .collect(Collectors.toList());

        // Featured Playlists
        List<PlaylistResponse> featuredPlaylists = playlistRepository.findByIsPublicTrue(limit6).getContent().stream()
                .map(playlistMapper::toPlaylistResponse)
                .collect(Collectors.toList());

        return HomeFeedResponse.builder()
                .trendingSongs(trending)
                .newReleases(newReleases)
                .recommendations(recommendations)
                .topArtists(topArtists)
                .popularAlbums(popularAlbums)
                .featuredPlaylists(featuredPlaylists)
                .build();
    }

    private SongResponse mapSongWithLikes(Song song, UUID currentUserId) {
        SongResponse res = catalogMapper.toSongResponse(song);
        if (currentUserId != null) {
            res.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, song.getId()));
        }
        return res;
    }
}
