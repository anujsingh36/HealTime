package io.healtime.repository;

import io.healtime.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findAllByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<Prescription> findAllByAppointmentId(UUID appointmentId);
}
