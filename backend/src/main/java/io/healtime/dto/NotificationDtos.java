package io.healtime.dto;

import io.healtime.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public class NotificationDtos {
    public record NotificationView(UUID id, NotificationType type, String title, String body,
                                   String link, boolean read, Instant createdAt) {}
}
