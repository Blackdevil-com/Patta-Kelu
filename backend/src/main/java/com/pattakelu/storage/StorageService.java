package com.pattakelu.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    String storeFile(MultipartFile file, String subDirectory);
    Resource loadAsResource(String fileKey);
    long getFileSize(String fileKey);
    InputStream getByteRangeStream(String fileKey, long start, long length);
    void deleteFile(String fileKey);
}
