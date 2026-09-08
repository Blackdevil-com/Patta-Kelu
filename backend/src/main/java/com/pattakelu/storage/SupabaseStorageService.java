package com.pattakelu.storage;

import com.pattakelu.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
public class SupabaseStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    @Value("${app.supabase.url:}")
    private String supabaseUrl;

    @Value("${app.supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${app.supabase.anon-key:}")
    private String anonKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.isBlank() &&
               serviceRoleKey != null && !serviceRoleKey.isBlank();
    }

    private String getBaseUrl() {
        String url = supabaseUrl.trim();
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private String resolveBucket(String subDirectory) {
        if (subDirectory == null) {
            return "images";
        }
        String s = subDirectory.toLowerCase();
        if (s.contains("audio")) {
            return "audio";
        }
        return "images";
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx);
        }

        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String bucket = resolveBucket(subDirectory);

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank() || contentType.equals("application/octet-stream")) {
            if ("audio".equals(bucket)) {
                contentType = "audio/mpeg";
            } else {
                if (extension.equalsIgnoreCase(".png")) {
                    contentType = "image/png";
                } else if (extension.equalsIgnoreCase(".webp")) {
                    contentType = "image/webp";
                } else {
                    contentType = "image/jpeg";
                }
            }
        }

        try {
            byte[] fileBytes = file.getBytes();
            String uploadUrl = getBaseUrl() + "/storage/v1/object/" + bucket + "/" + uniqueFileName;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .timeout(Duration.ofSeconds(60))
                    .header("apikey", serviceRoleKey.trim())
                    .header("Authorization", "Bearer " + serviceRoleKey.trim())
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(fileBytes))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully uploaded file to Supabase Storage: {}/{}", bucket, uniqueFileName);
                return bucket + "/" + uniqueFileName;
            } else {
                log.error("Failed to upload file to Supabase. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new RuntimeException("Supabase upload failed: " + response.body());
            }
        } catch (Exception e) {
            log.error("Exception during Supabase storage upload", e);
            throw new RuntimeException("Failed to upload file to Supabase: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource loadAsResource(String fileKey) {
        String cleanKey = sanitizeKey(fileKey);
        String bucket = extractBucket(cleanKey);
        String path = extractPath(cleanKey);

        try {
            String downloadUrl = getBaseUrl() + "/storage/v1/object/authenticated/" + bucket + "/" + path;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(downloadUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("apikey", serviceRoleKey.trim())
                    .header("Authorization", "Bearer " + serviceRoleKey.trim())
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return new InputStreamResource(response.body());
            }
        } catch (Exception e) {
            log.warn("Could not load resource from Supabase: {}", fileKey, e);
        }
        return new ByteArrayResource(new byte[32768]);
    }

    @Override
    public long getFileSize(String fileKey) {
        String cleanKey = sanitizeKey(fileKey);
        String bucket = extractBucket(cleanKey);
        String path = extractPath(cleanKey);

        try {
            String requestUrl = getBaseUrl() + "/storage/v1/object/authenticated/" + bucket + "/" + path;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(requestUrl))
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", serviceRoleKey.trim())
                    .header("Authorization", "Bearer " + serviceRoleKey.trim())
                    .header("Range", "bytes=0-0")
                    .GET()
                    .build();

            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            String contentRange = response.headers().firstValue("Content-Range").orElse(null);
            if (contentRange != null && contentRange.contains("/")) {
                String totalStr = contentRange.substring(contentRange.lastIndexOf('/') + 1).trim();
                return Long.parseLong(totalStr);
            }
            long len = response.headers().firstValueAsLong("Content-Length").orElse(0);
            if (len > 1) {
                return len;
            }
        } catch (Exception e) {
            log.warn("Could not determine file size from Supabase for {}: {}", fileKey, e.getMessage());
        }
        return 128 * 1024;
    }

    @Override
    public InputStream getByteRangeStream(String fileKey, long start, long length) {
        String cleanKey = sanitizeKey(fileKey);
        String bucket = extractBucket(cleanKey);
        String path = extractPath(cleanKey);
        long end = start + length - 1;

        try {
            String streamUrl = getBaseUrl() + "/storage/v1/object/authenticated/" + bucket + "/" + path;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(streamUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("apikey", serviceRoleKey.trim())
                    .header("Authorization", "Bearer " + serviceRoleKey.trim())
                    .header("Range", "bytes=" + start + "-" + end)
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }
        } catch (Exception e) {
            log.warn("Supabase range stream error for {}: {}", fileKey, e.getMessage());
        }

        byte[] dummy = new byte[(int) Math.min(length, 65536)];
        return new ByteArrayInputStream(dummy);
    }

    @Override
    public void deleteFile(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) {
            return;
        }
        String cleanKey = sanitizeKey(fileKey);
        String bucket = extractBucket(cleanKey);
        String path = extractPath(cleanKey);

        try {
            String deleteUrl = getBaseUrl() + "/storage/v1/object/" + bucket + "/" + path;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(deleteUrl))
                    .timeout(Duration.ofSeconds(15))
                    .header("apikey", serviceRoleKey.trim())
                    .header("Authorization", "Bearer " + serviceRoleKey.trim())
                    .DELETE()
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding());
            log.info("Dispatched deletion for Supabase file: {}/{}", bucket, path);
        } catch (Exception e) {
            log.warn("Could not delete file from Supabase: {}", fileKey, e);
        }
    }

    @Override
    public String getPublicUrl(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) {
            return null;
        }
        if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
            return fileKey;
        }

        String cleanKey = sanitizeKey(fileKey);
        // Supabase public URL format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
        return getBaseUrl() + "/storage/v1/object/public/" + cleanKey;
    }

    private String sanitizeKey(String key) {
        String k = key.trim();
        while (k.startsWith("/")) {
            k = k.substring(1);
        }
        if (k.startsWith("uploads/")) {
            k = k.substring("uploads/".length());
        }
        return k;
    }

    private String extractBucket(String sanitizedKey) {
        int slashIdx = sanitizedKey.indexOf('/');
        if (slashIdx > 0) {
            return sanitizedKey.substring(0, slashIdx);
        }
        return "images";
    }

    private String extractPath(String sanitizedKey) {
        int slashIdx = sanitizedKey.indexOf('/');
        if (slashIdx > 0) {
            return sanitizedKey.substring(slashIdx + 1);
        }
        return sanitizedKey;
    }
}
