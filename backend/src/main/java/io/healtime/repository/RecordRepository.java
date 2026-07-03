package io.healtime.repository;

import io.healtime.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecordRepository extends JpaRepository<MedicalRecord, UUID> {
    List<MedicalRecord> findAllByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
