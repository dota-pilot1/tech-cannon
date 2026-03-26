package com.mapo.palantier.upload.presentation;

import com.mapo.palantier.upload.application.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final S3Service s3Service;

    @PostMapping("/presign")
    public ResponseEntity<S3Service.PresignedUrlResponse> createPresignedUrl(
            @RequestBody PresignRequest request
    ) {
        S3Service.PresignedUrlResponse response = s3Service.createPresignedPutUrl(
                request.filename(),
                request.contentType()
        );
        return ResponseEntity.ok(response);
    }

    public record PresignRequest(
            String filename,
            String contentType
    ) {}
}
