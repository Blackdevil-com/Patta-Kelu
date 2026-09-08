package com.pattakelu.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Automatically detects and loads .env properties into JVM System properties
 * before Spring Boot initializes its ApplicationContext, and normalizes
 * Supabase / PostgreSQL database connection credentials.
 */
public class DotenvPropertyLoader implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(DotenvPropertyLoader.class);
    private static boolean loaded = false;

    public static synchronized void load() {
        if (loaded) {
            return;
        }

        List<Path> searchPaths = List.of(
                Paths.get(".env"),
                Paths.get("../.env"),
                Paths.get("backend/.env"),
                Paths.get(System.getProperty("user.dir", "."), ".env"),
                Paths.get(System.getProperty("user.dir", "."), "..", ".env")
        );

        Path foundEnv = null;
        for (Path p : searchPaths) {
            try {
                if (Files.exists(p) && Files.isRegularFile(p)) {
                    foundEnv = p.toAbsolutePath().normalize();
                    break;
                }
            } catch (Exception ignored) {}
        }

        if (foundEnv != null) {
            log.info("Loading environment configuration from: {}", foundEnv);
            int loadedCount = 0;
            try (BufferedReader reader = Files.newBufferedReader(foundEnv, StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }

                    int eqIdx = line.indexOf('=');
                    if (eqIdx <= 0) {
                        continue;
                    }

                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();

                    // Strip surrounding single or double quotes
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }

                    // If not explicitly set in OS environment or system properties, set it
                    if (System.getenv(key) == null && System.getProperty(key) == null) {
                        System.setProperty(key, value);
                        loadedCount++;
                    }
                }
                log.info("Successfully loaded {} environment variables from .env", loadedCount);
            } catch (IOException e) {
                log.warn("Failed reading .env file from {}: {}", foundEnv, e.getMessage());
            }
        } else {
            log.info("No .env file discovered in standard search paths. Relying on system environment variables.");
        }

        // Normalize PostgreSQL & Supabase connection properties (Render / Docker / Local)
        normalizeDatabaseProperties();

        loaded = true;
    }

    private static void normalizeDatabaseProperties() {
        String dbUrl = getPropertyOrEnv("DATABASE_URL");
        String dbUser = getPropertyOrEnv("DATABASE_USERNAME");
        String dbPass = getPropertyOrEnv("DATABASE_PASSWORD");
        String supabaseUrl = getPropertyOrEnv("SUPABASE_URL");

        String projectRef = null;
        if (supabaseUrl != null && !supabaseUrl.isBlank()) {
            try {
                URI uri = URI.create(supabaseUrl.trim());
                String host = uri.getHost();
                if (host != null && host.contains(".")) {
                    projectRef = host.substring(0, host.indexOf('.')).trim();
                }
            } catch (Exception ignored) {}
        }

        // Parse connection URI if user:password@host is present
        if (dbUrl != null && (dbUrl.contains("@") || dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            String parseTarget = dbUrl.trim();
            if (parseTarget.startsWith("jdbc:")) {
                parseTarget = parseTarget.substring(5);
            }
            if (parseTarget.startsWith("postgres://")) {
                parseTarget = "postgresql://" + parseTarget.substring("postgres://".length());
            }

            try {
                URI uri = URI.create(parseTarget);
                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    int colon = userInfo.indexOf(':');
                    if (colon >= 0) {
                        if (dbUser == null || dbUser.isBlank()) {
                            dbUser = userInfo.substring(0, colon);
                        }
                        if (dbPass == null || dbPass.isBlank()) {
                            dbPass = userInfo.substring(colon + 1);
                        }
                    } else if (dbUser == null || dbUser.isBlank()) {
                        dbUser = userInfo;
                    }
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                if (path == null || path.isEmpty() || path.equals("/")) {
                    path = "/postgres";
                }

                dbUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path;
            } catch (Exception e) {
                log.warn("Could not parse DATABASE_URL URI: {}", e.getMessage());
            }
        }

        // Ensure Supabase tenant reference (e.g. postgres.<project-ref>) on pooler connections
        if (dbUrl != null && dbUrl.contains("pooler.supabase.com")) {
            if (dbUser != null && !dbUser.contains(".") && projectRef != null && !projectRef.isBlank()) {
                dbUser = dbUser + "." + projectRef;
                log.info("Appended Supabase tenant identifier to database username: {}", dbUser);
            }

            if (dbUser != null && !dbUser.isBlank() && dbPass != null && !dbPass.isBlank()) {
                if (!dbUrl.contains("user=") && !dbUrl.contains("password=")) {
                    String separator = dbUrl.contains("?") ? "&" : "?";
                    dbUrl = dbUrl + separator + "user=" + dbUser + "&password=" + dbPass + "&sslmode=require";
                }
            }
        }

        if (dbUrl != null) {
            System.setProperty("DATABASE_URL", dbUrl);
        }
        if (dbUser != null) {
            System.setProperty("DATABASE_USERNAME", dbUser);
        }
        if (dbPass != null) {
            System.setProperty("DATABASE_PASSWORD", dbPass);
        }
    }

    private static String getPropertyOrEnv(String key) {
        String val = System.getProperty(key);
        if (val != null && !val.isBlank()) {
            return val.trim();
        }
        val = System.getenv(key);
        if (val != null && !val.isBlank()) {
            return val.trim();
        }
        return null;
    }

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        load();
    }
}
