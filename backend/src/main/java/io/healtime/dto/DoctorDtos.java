package io.healtime.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class DoctorDtos {

    public record DoctorView(
        UUID id, UUID userId, String fullName, String email, String avatarUrl,
        String specialization, String specializationSlug,
        String licenseNumber, Integer yearsExperience, String bio,
        BigDecimal consultationFee, String clinicName, String location,
        BigDecimal rating, boolean verified
    ) {}

    public record DoctorUpdateRequest(
        UUID specializationId,
        String licenseNumber,
        Integer yearsExperience,
        String bio,
        BigDecimal consultationFee,
        String clinicName,
        String location
    ) {}

    public record AvailabilitySlot(
        @NotNull DayOfWeek dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull Integer slotDurationMin
    ) {}

    public record AvailabilityUpdateRequest(@NotNull List<AvailabilitySlot> slots) {}

    public record SpecializationView(UUID id, String name, String slug, String description, String icon) {}
}
