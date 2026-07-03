package io.healtime.service;

import io.healtime.dto.RecordDtos.RecordView;
import io.healtime.entity.MedicalRecord;
import io.healtime.entity.User;
import io.healtime.exception.ApiException;
import io.healtime.repository.RecordRepository;
import io.healtime.repository.UserRepository;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    private RecordView toView(MedicalRecord r) {
        return new RecordView(r.getId(), r.getTitle(), r.getRecordType(), r.getFileUrl(),
            r.getFileSize(), r.getNotes(), r.getCreatedAt());
    }
}
