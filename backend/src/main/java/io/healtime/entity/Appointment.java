package io.healtime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity @Table(name = "appointments", indexes = {
        @Index(name = "idx_appt_doctor_date", columnList = "doctor_id, scheduled_at"),
        @Index(name = "idx_appt_patient", columnList = "patient_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(columnDefinition = "text") private String reason;
    @Column(columnDefinition = "text") private String notes;

    private Integer queuePosition;
    private Integer estimatedWaitMin;

    private Instant startedAt;
    private Instant completedAt;

    private Double patientLat;
    private Double patientLng;
    private Instant patientLocationUpdatedAt;

    @Builder.Default
    private boolean leaveNotified = false;
}