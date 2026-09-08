package com.pattakelu.configuration;

import com.pattakelu.storage.LocalStorageService;
import com.pattakelu.storage.StorageService;
import com.pattakelu.storage.SupabaseStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class StorageConfiguration {

    private static final Logger log = LoggerFactory.getLogger(StorageConfiguration.class);

    @Bean
    @Primary
    public StorageService storageService(
            @Value("${app.storage.type:supabase}") String storageType,
            LocalStorageService localStorageService,
            SupabaseStorageService supabaseStorageService) {

        if ("supabase".equalsIgnoreCase(storageType)) {
            if (supabaseStorageService.isConfigured()) {
                log.info("Using Supabase Storage for files (audio and images).");
                return supabaseStorageService;
            } else {
                log.warn("Supabase Storage selected but credentials not fully provided. Falling back to local storage.");
            }
        } else {
            log.info("Using Local Storage for files ({}).", storageType);
        }

        return localStorageService;
    }
}
