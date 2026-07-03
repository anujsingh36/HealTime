package io.healtime.repository;

import io.healtime.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByUserId(UUID userId);

    @Query("""
      select d from Doctor d
      where (:spec is null or d.specialization.slug = :spec)
        and (:q is null or lower(d.user.fullName) like lower(concat('%',:q,'%'))
                       or lower(coalesce(d.location,'')) like lower(concat('%',:q,'%'))
                       or lower(coalesce(d.clinicName,'')) like lower(concat('%',:q,'%')))
    """)
    Page<Doctor> search(@Param("spec") String spec, @Param("q") String q, Pageable pageable);
}
