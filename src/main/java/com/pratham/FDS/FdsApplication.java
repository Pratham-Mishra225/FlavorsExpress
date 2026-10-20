package com.pratham.FDS;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.pratham.FDS.config.DotenvInitializer;

@SpringBootApplication
public class FdsApplication {

	public static void main(String[] args) {
		DotenvInitializer.loadDotenvMap().forEach((k, v) -> {
			if (System.getProperty(k) == null && System.getenv(k) == null) {
				System.setProperty(k, v.toString());
			}
		});
		SpringApplication.run(FdsApplication.class, args);
	}

}
