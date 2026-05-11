package com.ghostmode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GhostModeApplication {

    public static void main(String[] args) {
        SpringApplication.run(GhostModeApplication.class, args);
    }
}
