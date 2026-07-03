package io.healtime.controller;

import io.healtime.dto.NotificationDtos.NotificationView;
import io.healtime.security.SecurityUtils;
import io.healtime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notifications;
    private final SecurityUtils security;

    @GetMapping
    public List<NotificationView> list() { return notifications.list(security.currentUser().getId()); }

    @GetMapping("/unread-count")
    public Map<String,Long> unread() { return Map.of("count", notifications.unreadCount(security.currentUser().getId())); }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable UUID id) { notifications.markRead(id); }
}
