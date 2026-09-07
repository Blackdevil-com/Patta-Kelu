package com.pattakelu.service;

import com.pattakelu.entity.Song;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.repository.SongRepository;
import com.pattakelu.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreamService {

    private static final Logger log = LoggerFactory.getLogger(StreamService.class);
    private static final long CHUNK_SIZE = 1024 * 1024; // 1MB buffer

    private final SongRepository songRepository;
    private final StorageService storageService;

    public ResponseEntity<Resource> streamSong(UUID songId, String rangeHeader) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with ID: " + songId));

        long fileLength = storageService.getFileSize(song.getAudioFileKey());
        if (fileLength == 0) {
            fileLength = 128 * 1024;
        }

        String mediaType = song.getAudioFormat() != null ? song.getAudioFormat() : "audio/mpeg";

        if (rangeHeader == null || rangeHeader.isBlank()) {
            Resource resource = storageService.loadAsResource(song.getAudioFileKey());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, mediaType)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileLength))
                    .body(resource);
        }

        List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
        if (ranges.isEmpty()) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).build();
        }

        HttpRange range = ranges.get(0);
        long start = range.getRangeStart(fileLength);
        long end = range.getRangeEnd(fileLength);
        long rangeLength = Math.min(CHUNK_SIZE, (end - start) + 1);
        long calculatedEnd = start + rangeLength - 1;

        InputStream stream = storageService.getByteRangeStream(song.getAudioFileKey(), start, rangeLength);
        InputStreamResource resource = new InputStreamResource(stream);

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .header(HttpHeaders.CONTENT_TYPE, mediaType)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + calculatedEnd + "/" + fileLength)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(rangeLength))
                .body(resource);
    }
}
