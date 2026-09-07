package com.pattakelu.mapper;

import com.pattakelu.dto.response.PlaylistResponse;
import com.pattakelu.entity.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CatalogMapper.class})
public interface PlaylistMapper {

    @Mapping(target = "ownerId", source = "user.id")
    @Mapping(target = "ownerName", source = "user.displayName")
    @Mapping(target = "trackCount", expression = "java(playlist.getPlaylistSongs() != null ? playlist.getPlaylistSongs().size() : 0)")
    @Mapping(target = "tracks", ignore = true)
    PlaylistResponse toPlaylistResponse(Playlist playlist);
}
