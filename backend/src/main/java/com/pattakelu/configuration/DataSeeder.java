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

import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
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

        // Seed Admin Account (Allows managing platform & uploading songs)
        userRepository.findByEmail("admin@pattakelu.com").orElseGet(() -> {
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

        // Seed Genres for song categorization
        List<String> genreNames = List.of("Pop", "Hip Hop", "Rock", "Electronic", "R&B", "Indie", "Classical", "Jazz", "Soundtrack");
        for (String g : genreNames) {
            String slug = g.toLowerCase().replace(" ", "-").replace("&", "and");
            genreRepository.findBySlug(slug)
                    .orElseGet(() -> genreRepository.save(Genre.builder().name(g).slug(slug).colorCode("#1DB954").build()));
        }

        log.info("Baseline security roles, admin user, and genres initialized. Music catalog ready for user uploads.");
    }
}
