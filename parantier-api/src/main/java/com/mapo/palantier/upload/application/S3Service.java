package com.mapo.palantier.upload.application;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public PresignedUrlResponse createPresignedPutUrl(String filename, String contentType) {
        // Generate unique key with UUID prefix
        String key = "issues/" + UUID.randomUUID() + "-" + filename;

        // Create PutObjectRequest
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

        // Create presigned request (expires in 5 minutes)
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        // Build public URL
        String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName, region, key);

        return new PresignedUrlResponse(
                presignedRequest.url().toString(),
                publicUrl,
                key
        );
    }

    public record PresignedUrlResponse(
            String presignedUrl,
            String publicUrl,
            String key
    ) {}
}
