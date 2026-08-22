package io.healtime.dto;

import io.healtime.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class AppointmentDtos {

    public record BookRequest(
            @NotNull UUID doctorId,
            @NotNull Instant scheduledAt,
            String reason
    ) {}

    public record AppointmentView(
            UUID id, UUID doctorId, String doctorName, String specialization,
            UUID patientId, String patientName,
            Instant scheduledAt, AppointmentStatus status,
            Integer queuePosition, Integer estimatedWaitMin,
            String reason, String notes
    ) {}

    public record StatusUpdate(@NotNull AppointmentStatus status, String notes) {}

    public record QueueView(UUID appointmentId, Integer position, Integer estimatedWaitMin, AppointmentStatus status) {}

    public record LocationUpdate(@NotNull Double lat, @NotNull Double lng) {}
}