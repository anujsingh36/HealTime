package io.healtime.service;

import io.healtime.dto.RecordDtos.RecordView;
import io.healtime.entity.MedicalRecord;
import io.healtime.entity.Role;
import io.healtime.entity.User;
import io.healtime.exception.ApiException;
import io.healtime.repository.RecordRepository;
import io.healtime.repository.UserRepository;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordService {

    private static final Path UPLOAD_DIR = Path.of(System.getProperty("user.dir"), "uploads", "records");

    private final RecordRepository repo;
    private final UserRepository users;
    private final SecurityUtils security;

    public List<RecordView> myRecords() {
        return repo.findAllByPatientIdOrderByCreatedAtDesc(security.currentUser().getId())
                .stream().map(this::toView).toList();
    }

    public List<RecordView> patientRecords(UUID patientId) {
        return repo.findAllByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::toView).toList();
    }

    public RecordView upload(MultipartFile file, String title, String recordType, String notes) {
        try {
            Files.createDirectories(UPLOAD_DIR);
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path target = UPLOAD_DIR.resolve(filename);
            file.transferTo(target);
            User me = security.currentUser();
            MedicalRecord r = MedicalRecord.builder()
                    .patient(me).uploadedBy(me)
                    .title(title).recordType(recordType)
                    .fileUrl("/uploads/records/" + filename)
                    .fileSize(file.getSize())
                    .notes(notes).build();
            return toView(repo.save(r));
        } catch (IOException e) {
            throw ApiException.badRequest("Upload failed: " + e.getMessage());
        }
    }

    /**
     * Streams the underlying file for a record, after verifying the current user is allowed
     * to see it: either the owning patient, or a doctor/admin (medical records contain PHI, so
     * this must never be served as a plain public static file).
     */
    public LoadedFile loadFile(UUID recordId) {
        MedicalRecord r = repo.findById(recordId).orElseThrow(() -> ApiException.notFound("Record"));
        User me = security.currentUser();
        boolean isOwner = r.getPatient().getId().equals(me.getId());
        boolean isClinicalStaff = me.getRoles().contains(Role.DOCTOR) || me.getRoles().contains(Role.ADMIN);
        if (!isOwner && !isClinicalStaff) {
            throw ApiException.forbidden("You don't have access to this record");
        }

        String filename = r.getFileUrl().substring(r.getFileUrl().lastIndexOf('/') + 1);
        Path filePath = UPLOAD_DIR.resolve(filename).normalize();
        if (!filePath.startsWith(UPLOAD_DIR)) {
            throw ApiException.badRequest("Invalid record file path");
        }
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw ApiException.notFound("Record file");
            }
            return new LoadedFile(resource, originalFilenamePart(filename), r.getTitle());
        } catch (MalformedURLException e) {
            throw ApiException.badRequest("Invalid record file path");
        }
    }

    private String originalFilenamePart(String storedFilename) {
        // stored as "<uuid>-<originalFilename>" — strip the uuid prefix back off for a nicer download name
        int dash = storedFilename.indexOf('-');
        return dash >= 0 && dash < storedFilename.length() - 1 ? storedFilename.substring(dash + 1) : storedFilename;
    }

    public record LoadedFile(Resource resource, String downloadFilename, String title) {}

    private RecordView toView(MedicalRecord r) {
        return new RecordView(r.getId(), r.getTitle(), r.getRecordType(), r.getFileUrl(),
                r.getFileSize(), r.getNotes(), r.getCreatedAt());
    }
}