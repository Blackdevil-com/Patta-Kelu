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
public class SearchService {

    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final PlaylistRepository playlistRepository;
    private final LikedSongRepository likedSongRepository;
    private final FollowedArtistRepository followedArtistRepository;
    private final CatalogMapper catalogMapper;
    private final PlaylistMapper playlistMapper;

    @Transactional(readOnly = true)
    public SearchResultResponse search(String query, UUID currentUserId) {
        if (query == null || query.trim().isBlank()) {
            return SearchResultResponse.builder()
                    .songs(List.of())
                    .artists(List.of())
                    .albums(List.of())
                    .playlists(List.of())
                    .build();
        }

        String sanitized = query.trim();
        PageRequest pageRequest = PageRequest.of(0, 10);

        List<SongResponse> songResults = songRepository.searchSongs(sanitized, pageRequest).getContent().stream()
                .map(s -> {
                    SongResponse res = catalogMapper.toSongResponse(s);
                    if (currentUserId != null) {
                        res.setLiked(likedSongRepository.existsByUserIdAndSongId(currentUserId, s.getId()));
                    }
                    return res;
                })
                .collect(Collectors.toList());

        List<ArtistResponse> artistResults = artistRepository.searchArtists(sanitized, pageRequest).getContent().stream()
                .map(a -> {
                    ArtistResponse res = catalogMapper.toArtistResponse(a);
                    if (currentUserId != null) {
                        res.setFollowed(followedArtistRepository.existsByUserIdAndArtistId(currentUserId, a.getId()));
                    }
                    return res;
                })
                .collect(Collectors.toList());

        List<AlbumResponse> albumResults = albumRepository.searchAlbums(sanitized, pageRequest).getContent().stream()
                .map(catalogMapper::toAlbumResponse)
                .collect(Collectors.toList());

        List<PlaylistResponse> playlistResults = playlistRepository.searchPublicPlaylists(sanitized, pageRequest).getContent().stream()
                .map(playlistMapper::toPlaylistResponse)
                .collect(Collectors.toList());

        return SearchResultResponse.builder()
                .songs(songResults)
                .artists(artistResults)
                .albums(albumResults)
                .playlists(playlistResults)
                .build();
    }
}
