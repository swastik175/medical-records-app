package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path fileStorageLocation;
    private final List<String> allowedExtensions = Arrays.asList("pdf", "jpg", "jpeg", "png", "webp");

    @Value("${app.supabase.url:}")
    private String supabaseUrl;

    @Value("${app.supabase.key:}")
    private String supabaseKey;

    @Value("${app.supabase.bucket:medical-documents}")
    private String supabaseBucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public FileStorageService(@Value("${app.storage.upload-dir:./uploads/medical-documents}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the upload directory where files will be stored.", ex);
        }
    }

    public boolean isSupabaseConfigured() {
        return StringUtils.hasText(supabaseUrl) && StringUtils.hasText(supabaseKey);
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

        if (originalFileName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFileName);
        }

        String storedFileName = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");

        // If Supabase Storage is configured, upload to Supabase bucket
        if (isSupabaseConfigured()) {
            try {
                String cleanBase = supabaseUrl.replaceAll("/+$", "");
                String uploadEndpoint = cleanBase + "/storage/v1/object/" + supabaseBucket + "/" + storedFileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("apikey", supabaseKey);
                headers.set("Authorization", "Bearer " + supabaseKey);
                headers.setContentType(MediaType.parseMediaType(
                        file.getContentType() != null ? file.getContentType() : "application/octet-stream"
                ));

                HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
                ResponseEntity<String> response = restTemplate.exchange(uploadEndpoint, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    log.info("Successfully uploaded file {} to Supabase bucket {}", storedFileName, supabaseBucket);
                    return storedFileName;
                } else {
                    log.warn("Supabase upload returned non-2xx: {}, falling back to local storage", response.getStatusCode());
                }
            } catch (Exception ex) {
                log.error("Failed to upload to Supabase, falling back to local file storage: {}", ex.getMessage());
            }
        }

        // Local storage fallback
        try {
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storedFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new ResourceNotFoundException("File name is empty");
        }

        // Check Supabase if configured
        if (isSupabaseConfigured()) {
            try {
                String cleanBase = supabaseUrl.replaceAll("/+$", "");
                String downloadEndpoint = cleanBase + "/storage/v1/object/authenticated/" + supabaseBucket + "/" + fileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("apikey", supabaseKey);
                headers.set("Authorization", "Bearer " + supabaseKey);
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<byte[]> response = restTemplate.exchange(downloadEndpoint, HttpMethod.GET, entity, byte[].class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return new ByteArrayResource(response.getBody());
                }
            } catch (Exception ex) {
                log.warn("Supabase fetch failed for {}: {}, attempting local fallback", fileName, ex.getMessage());
            }
        }

        // Local storage fallback
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

        boolean deletedFromSupabase = false;
        if (isSupabaseConfigured()) {
            try {
                String cleanBase = supabaseUrl.replaceAll("/+$", "");
                String deleteEndpoint = cleanBase + "/storage/v1/object/" + supabaseBucket + "/" + fileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("apikey", supabaseKey);
                headers.set("Authorization", "Bearer " + supabaseKey);
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<String> response = restTemplate.exchange(deleteEndpoint, HttpMethod.DELETE, entity, String.class);
                deletedFromSupabase = response.getStatusCode().is2xxSuccessful();
            } catch (Exception ex) {
                log.warn("Failed to delete {} from Supabase: {}", fileName, ex.getMessage());
            }
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            boolean localDeleted = Files.deleteIfExists(filePath);
            return deletedFromSupabase || localDeleted;
        } catch (IOException ex) {
            return deletedFromSupabase;
        }
    }
}
