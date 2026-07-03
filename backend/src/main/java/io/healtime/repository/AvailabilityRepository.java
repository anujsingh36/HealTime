package io.healtime.repository;

import io.healtime.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvailabilityRepository extends JpaRepository<DoctorAvailability, UUID> {
    List<DoctorAvailability> findAllByDoctorId(UUID doctorId);
    void deleteAllByDoctorId(UUID doctorId);
}
