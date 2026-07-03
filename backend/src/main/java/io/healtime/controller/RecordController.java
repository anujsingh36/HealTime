package io.healtime.controller;

import io.healtime.dto.RecordDtos.RecordView;
import io.healtime.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RecordController {
    private final RecordService records;

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/records")
    public List<RecordView> mine() { return records.myRecords(); }

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping(value = "/patient/records", consumes = "multipart/form-data")
    public RecordView upload(@RequestPart("file") MultipartFile file,
                             @RequestParam String title,
                             @RequestParam(required = false) String recordType,
                             @RequestParam(required = false) String notes) {
        return records.upload(file, title, recordType, notes);
    }

    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @GetMapping("/doctor/patients/{patientId}/records")
    public List<RecordView> patientRecords(@PathVariable UUID patientId) {
        return records.patientRecords(patientId);
    }
}
