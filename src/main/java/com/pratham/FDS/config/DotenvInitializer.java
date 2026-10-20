package com.pratham.FDS.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Initializes the Spring Environment with properties from a local '.env' file if present,
 * bridging externalized secrets with Spring's environment resolution without hardcoding credentials.
 */
public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(DotenvInitializer.class);

    static {
        // Run early so system properties are populated before any logging/context bootstrapping
        loadToSystemProperties();
    }

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Map<String, Object> envMap = loadDotenvMap();
        if (!envMap.isEmpty()) {
            applicationContext.getEnvironment()
                    .getPropertySources()
                    .addFirst(new MapPropertySource("dotenvProperties", envMap));
            log.info("Loaded {} configuration properties from .env into Spring Environment", envMap.size());
        } else {
            log.info("No .env file found or file is empty; relying on system environment variables.");
        }
    }

    public static void loadToSystemProperties() {
        Map<String, Object> map = loadDotenvMap();
        map.forEach((k, v) -> {
            if (System.getProperty(k) == null && System.getenv(k) == null) {
                System.setProperty(k, v.toString());
            }
        });
    }

    public static Map<String, Object> loadDotenvMap() {
        Map<String, Object> properties = new HashMap<>();

        // Check common locations: working directory or parent directory
        Path[] candidatePaths = new Path[]{
                Paths.get(".env"),
                Paths.get("..", ".env"),
                Paths.get(System.getProperty("user.dir", "."), ".env")
        };

        File envFile = null;
        for (Path candidate : candidatePaths) {
            File f = candidate.toFile();
            if (f.exists() && f.isFile()) {
                envFile = f;
                break;
            }
        }

        if (envFile == null) {
            return properties;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int equalsIndex = line.indexOf('=');
                if (equalsIndex > 0) {
                    String key = line.substring(0, equalsIndex).trim();
                    String value = line.substring(equalsIndex + 1).trim();

                    // Strip optional quotes
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        if (value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                    }

                    properties.put(key, value);
                }
            }
        } catch (IOException e) {
            log.warn("Failed to read .env file at {}: {}", envFile.getAbsolutePath(), e.getMessage());
        }

        return properties;
    }
}
