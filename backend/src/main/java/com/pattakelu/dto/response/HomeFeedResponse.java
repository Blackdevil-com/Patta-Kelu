package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeFeedResponse {
    private List<SongResponse> trendingSongs;
    private List<SongResponse> newReleases;
    private List<SongResponse> recommendations;
    private List<ArtistResponse> topArtists;
    private List<AlbumResponse> popularAlbums;
    private List<PlaylistResponse> featuredPlaylists;
}
