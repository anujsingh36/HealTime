package io.healtime.service;

import io.healtime.dto.NotificationDtos.NotificationView;
import io.healtime.entity.*;
import io.healtime.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repo;

    @Async
    public void push(User user, NotificationType type, String title, String body, String link) {
        repo.save(Notification.builder()
            .user(user).type(type).title(title).body(body).link(link).build());
    }

    public List<NotificationView> list(UUID userId) {
        return repo.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(n -> new NotificationView(n.getId(), n.getType(), n.getTitle(), n.getBody(),
                n.getLink(), n.isRead(), n.getCreatedAt()))
            .toList();
    }

    public long unreadCount(UUID userId) { return repo.countByUserIdAndReadFalse(userId); }

    public void markRead(UUID notificationId) {
        repo.findById(notificationId).ifPresent(n -> { n.setRead(true); repo.save(n); });
    }
}
