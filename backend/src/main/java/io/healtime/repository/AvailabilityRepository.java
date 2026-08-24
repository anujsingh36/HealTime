package io.healtime.repository;

import io.healtime.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AvailabilityRepository extends JpaRepository<DoctorAvailability, UUID> {
    List<DoctorAvailability> findAllByDoctorId(UUID doctorId);


    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from DoctorAvailability a where a.doctor.id = :doctorId")
    void deleteAllByDoctorId(@Param("doctorId") UUID doctorId);
}