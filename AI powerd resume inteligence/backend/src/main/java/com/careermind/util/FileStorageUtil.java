package com.careermind.util;

import com.careermind.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
@Slf4j
public class FileStorageUtil {

    @Value("${app.upload.dir:uploads/resumes}")
    private String uploadDir;

    public String storeFile(MultipartFile file, Long userId) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf");

        // Prevent path traversal
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid filename containing unauthorized sequence: " + originalFilename);
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }

        String storedFileName = "user_" + userId + "_" + UUID.randomUUID() + fileExtension;

        try {
            Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(targetLocation);

            Path destinationPath = targetLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

            return storedFileName;
        } catch (IOException e) {
            log.error("Could not store file {}: {}", originalFilename, e.getMessage());
            throw new BadRequestException("Could not store file: " + e.getMessage());
        }
    }

    public void deleteFile(String storedFileName) {
        if (storedFileName == null || storedFileName.trim().isEmpty()) {
            return;
        }
        try {
            Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = targetLocation.resolve(storedFileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", storedFileName, e.getMessage());
        }
    }
}
