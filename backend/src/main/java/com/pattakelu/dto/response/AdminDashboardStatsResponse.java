package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long totalArtists;
    private long totalAlbums;
    private long totalSongs;
    private long totalPlaylists;
    private long totalPlays;
}
