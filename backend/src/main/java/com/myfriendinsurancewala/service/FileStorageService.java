package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final List<String> allowedExtensions = Arrays.asList("pdf", "jpg", "jpeg", "png", "webp");

    public FileStorageService(@Value("${app.storage.upload-dir:./uploads/medical-documents}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the upload directory where files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        
        // Security check: validate extension
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex + 1).toLowerCase();
        }

        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file type: " + extension + ". Allowed formats: PDF, JPG, PNG, WEBP.");
        }

        try {
            if (originalFileName.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFileName);
            }

            String storedFileName = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return storedFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or not readable: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
    }

    public boolean deleteFile(String fileName) {
        if (fileName == null || fileName.isBlank()) return false;
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            return false;
        }
    }
}
