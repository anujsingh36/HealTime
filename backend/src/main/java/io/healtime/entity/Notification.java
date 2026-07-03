package io.healtime.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "notifications", indexes = @Index(name = "idx_notif_user", columnList = "user_id, read"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false) private String title;
    @Column(columnDefinition = "text") private String body;
    private String link;
    @Builder.Default private boolean read = false;
}
