package io.healtime.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public class PrescriptionDtos {
    public record CreateRequest(
        @NotNull UUID appointmentId,
        String diagnosis,
        String instructions,
        Map<String,Object> medications,
        String fileUrl
    ) {}

    public record PrescriptionView(UUID id, UUID appointmentId, String diagnosis,
                                   String instructions, Map<String,Object> medications,
                                   String fileUrl, Instant createdAt) {}
}
