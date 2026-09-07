package com.pattakelu.configuration;

import com.pattakelu.entity.*;
import com.pattakelu.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Seed Roles
        Role roleUser = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").description("Listener").build()));
        Role roleArtist = roleRepository.findByName("ROLE_ARTIST")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ARTIST").description("Artist").build()));
        Role roleAdmin = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").description("Admin").build()));

        // Seed Admin & Demo User
        User admin = userRepository.findByEmail("admin@pattakelu.com").orElseGet(() -> {
            User u = User.builder()
                    .email("admin@pattakelu.com")
                    .username("admin")
                    .displayName("Patta Kelu Administrator")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .roles(Set.of(roleAdmin, roleUser))
                    .enabled(true)
                    .emailVerified(true)
                    .profileImageUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300")
                    .build();
            return userRepository.save(u);
        });

        User demoUser = userRepository.findByEmail("user@pattakelu.com").orElseGet(() -> {
            User u = User.builder()
                    .email("user@pattakelu.com")
                    .username("musiclover")
                    .displayName("Music Enthusiast")
                    .passwordHash(passwordEncoder.encode("User@123"))
                    .roles(Set.of(roleUser))
                    .enabled(true)
                    .emailVerified(true)
                    .profileImageUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300")
                    .build();
            return userRepository.save(u);
        });

        // Seed Genres
        List<String> genreNames = List.of("Pop", "Hip Hop", "Rock", "Electronic", "R&B", "Indie", "Classical", "Jazz", "Soundtrack");
        Map<String, Genre> genreMap = new HashMap<>();
        for (String g : genreNames) {
            String slug = g.toLowerCase().replace(" ", "-").replace("&", "and");
            Genre genre = genreRepository.findBySlug(slug)
                    .orElseGet(() -> genreRepository.save(Genre.builder().name(g).slug(slug).colorCode("#1DB954").build()));
            genreMap.put(g, genre);
        }

        // Check if catalog already populated
        if (songRepository.count() > 0) {
            log.info("Catalog already contains songs. Skipping catalog seed.");
            return;
        }

        log.info("Seeding initial music catalog...");

        // Artist 1: Anirudh Ravichander
        Artist anirudh = artistRepository.save(Artist.builder()
                .name("Anirudh Ravichander")
                .bio("India's viral musical powerhouse, rockstar composer and vocalist renowned for electrifying beats and anthem tracks.")
                .profileImageUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500")
                .coverImageUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200")
                .monthlyListeners(15400000L)
                .verified(true)
                .build());

        Album leo = albumRepository.save(Album.builder()
                .artist(anirudh)
                .title("Leo (Original Soundtrack)")
                .albumType("ALBUM")
                .releaseDate(LocalDate.of(2023, 10, 19))
                .coverImageUrl("https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500")
                .totalTracks(3)
                .build());

        createSong("Badass", anirudh, leo, 229, "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500", 1, 9540000L, List.of(genreMap.get("Rock"), genreMap.get("Soundtrack")));
        createSong("Naa Ready", anirudh, leo, 248, "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500", 2, 14200000L, List.of(genreMap.get("Pop"), genreMap.get("Hip Hop")));
        createSong("Ordinary Person", anirudh, leo, 138, "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500", 3, 5800000L, List.of(genreMap.get("Indie")));

        // Artist 2: A.R. Rahman
        Artist rahman = artistRepository.save(Artist.builder()
                .name("A.R. Rahman")
                .bio("The Mozart of Madras. Two-time Academy Award, two-time Grammy Award-winning musical titan fusing global world music with timeless melodies.")
                .profileImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500")
                .coverImageUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200")
                .monthlyListeners(18200000L)
                .verified(true)
                .build());

        Album roja = albumRepository.save(Album.builder()
                .artist(rahman)
                .title("Roja & Beyond")
                .albumType("ALBUM")
                .releaseDate(LocalDate.of(2022, 5, 10))
                .coverImageUrl("https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500")
                .totalTracks(2)
                .build());

        createSong("Chinna Chinna Aasai", rahman, roja, 295, "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500", 1, 11000000L, List.of(genreMap.get("Classical"), genreMap.get("Pop")));
        createSong("Pudhu Vellai Mazhai", rahman, roja, 316, "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500", 2, 8900000L, List.of(genreMap.get("Classical"), genreMap.get("Soundtrack")));

        // Artist 3: The Weeknd
        Artist weeknd = artistRepository.save(Artist.builder()
                .name("The Weeknd")
                .bio("Abel Tesfaye, known internationally as The Weeknd, is a Canadian singer-songwriter defining modern synth-pop, alternative R&B, and dance music.")
                .profileImageUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500")
                .coverImageUrl("https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200")
                .monthlyListeners(28900000L)
                .verified(true)
                .build());

        Album afterHours = albumRepository.save(Album.builder()
                .artist(weeknd)
                .title("After Hours")
                .albumType("ALBUM")
                .releaseDate(LocalDate.of(2020, 3, 20))
                .coverImageUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500")
                .totalTracks(2)
                .build());

        createSong("Blinding Lights", weeknd, afterHours, 200, "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500", 1, 35000000L, List.of(genreMap.get("Pop"), genreMap.get("Electronic")));
        createSong("Save Your Tears", weeknd, afterHours, 215, "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500", 2, 29000000L, List.of(genreMap.get("Pop"), genreMap.get("R&B")));

        // Artist 4: Dua Lipa
        Artist dua = artistRepository.save(Artist.builder()
                .name("Dua Lipa")
                .bio("Global superstar bringing infectious disco, funk, and high-energy modern dance-pop across international stages.")
                .profileImageUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500")
                .coverImageUrl("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200")
                .monthlyListeners(22400000L)
                .verified(true)
                .build());

        Album futureNostalgia = albumRepository.save(Album.builder()
                .artist(dua)
                .title("Future Nostalgia")
                .albumType("ALBUM")
                .releaseDate(LocalDate.of(2020, 3, 27))
                .coverImageUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500")
                .totalTracks(2)
                .build());

        createSong("Levitating", dua, futureNostalgia, 203, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500", 1, 26000000L, List.of(genreMap.get("Pop"), genreMap.get("Electronic")));
        createSong("Don't Start Now", dua, futureNostalgia, 183, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500", 2, 23000000L, List.of(genreMap.get("Pop"), genreMap.get("Electronic")));

        // Seed a sample Featured Playlist
        Playlist viralHits = playlistRepository.save(Playlist.builder()
                .user(admin)
                .name("Patta Kelu Top 50")
                .description("The hottest tracks trending across the world right now.")
                .coverImageUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500")
                .isPublic(true)
                .build());

        List<Song> allSongs = songRepository.findAll();
        int pos = 1;
        for (Song s : allSongs) {
            playlistSongRepository.save(PlaylistSong.builder()
                    .playlist(viralHits)
                    .song(s)
                    .position(pos++)
                    .build());
        }

        log.info("Catalog successfully seeded with {} songs across {} artists!", allSongs.size(), artistRepository.count());
    }

    private void createSong(String title, Artist artist, Album album, int duration, String coverUrl, int trackNum, long plays, List<Genre> genres) {
        Song song = Song.builder()
                .title(title)
                .artist(artist)
                .album(album)
                .duration(duration)
                .coverImageUrl(coverUrl)
                .trackNumber(trackNum)
                .discNumber(1)
                .audioFileKey("audio/" + title.toLowerCase().replace(" ", "_") + ".mp3")
                .audioFormat("audio/mpeg")
                .audioSizeBytes(3500000L)
                .releaseDate(album != null ? album.getReleaseDate() : LocalDate.now())
                .playCount(plays)
                .genres(new HashSet<>(genres))
                .build();
        songRepository.save(song);
    }
}
