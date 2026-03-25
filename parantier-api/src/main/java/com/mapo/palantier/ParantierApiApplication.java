package com.mapo.palantier;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.mapo.palantier", "com.palantier"})
@MapperScan(basePackages = {"com.mapo.palantier", "com.palantier"})
public class ParantierApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ParantierApiApplication.class, args);
	}

}
