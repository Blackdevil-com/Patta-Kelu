package com.pattakelu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PattaKeluApplication {

    public static void main(String[] args) {
        com.pattakelu.configuration.DotenvPropertyLoader.load();
        SpringApplication.run(PattaKeluApplication.class, args);
    }
}
