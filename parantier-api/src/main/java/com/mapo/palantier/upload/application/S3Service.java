package com.mapo.palantier.upload.application;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

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

    /**
     * 파일을 직접 S3에 업로드하고 공개 URL 반환
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Generate unique key
            String originalFilename = file.getOriginalFilename();
            String key = folder + "/" + UUID.randomUUID() + "-" + originalFilename;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Return public URL
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    public record PresignedUrlResponse(
            String presignedUrl,
            String publicUrl,
            String key
    ) {}
}
