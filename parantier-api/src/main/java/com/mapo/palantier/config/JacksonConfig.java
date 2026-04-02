package com.mapo.palantier.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.TimeZone;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // JavaTimeModule 등록 (LocalDateTime 등 Java 8 날짜 타입 지원)
        mapper.registerModule(new JavaTimeModule());

        // LocalDateTime을 타임스탬프(숫자)가 아닌 ISO 8601 문자열로 직렬화
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // UTC 기준으로 직렬화
        mapper.setTimeZone(TimeZone.getTimeZone("UTC"));

        return mapper;
    }
}
