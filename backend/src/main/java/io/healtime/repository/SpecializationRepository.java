package io.healtime.repository;

import io.healtime.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpecializationRepository extends JpaRepository<Specialization, UUID> {
    Optional<Specialization> findBySlug(String slug);
}
