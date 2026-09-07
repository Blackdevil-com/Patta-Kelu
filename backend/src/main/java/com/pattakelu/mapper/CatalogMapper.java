package com.pattakelu.mapper;

import com.pattakelu.dto.response.AlbumResponse;
import com.pattakelu.dto.response.ArtistResponse;
import com.pattakelu.dto.response.GenreResponse;
import com.pattakelu.dto.response.SongResponse;
import com.pattakelu.entity.Album;
import com.pattakelu.entity.Artist;
import com.pattakelu.entity.Genre;
import com.pattakelu.entity.Song;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CatalogMapper {

    @Mapping(target = "isFollowed", constant = "false")
    ArtistResponse toArtistResponse(Artist artist);

    @Mapping(target = "artistId", source = "artist.id")
    @Mapping(target = "artistName", source = "artist.name")
    AlbumResponse toAlbumResponse(Album album);

    GenreResponse toGenreResponse(Genre genre);

    @Mapping(target = "artistId", source = "artist.id")
    @Mapping(target = "artistName", source = "artist.name")
    @Mapping(target = "albumId", source = "album.id")
    @Mapping(target = "albumTitle", source = "album.title")
    @Mapping(target = "streamUrl", expression = "java(\"/api/v1/songs/\" + song.getId() + \"/stream\")")
    @Mapping(target = "isLiked", constant = "false")
    @Mapping(target = "genres", source = "genres", qualifiedByName = "genresToStrings")
    SongResponse toSongResponse(Song song);

    @Named("genresToStrings")
    default List<String> genresToStrings(Set<Genre> genres) {
        if (genres == null) return List.of();
        return genres.stream().map(Genre::getName).collect(Collectors.toList());
    }
}
