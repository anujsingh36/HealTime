package io.healtime.dto;

import java.time.Instant;
import java.util.UUID;

public class RecordDtos {
    public record RecordView(UUID id, String title, String recordType, String fileUrl,
                             Long fileSize, String notes, Instant createdAt) {}
}
