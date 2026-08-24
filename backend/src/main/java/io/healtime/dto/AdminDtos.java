package io.healtime.dto;

import java.time.Instant;
import java.util.UUID;

public class AdminDtos {
    public record DashboardStats(
            long totalPatients,
            long totalDoctors,
            long totalAppointments,
            long appointmentsToday,
            long pendingAppointments,
            long completedAppointments
    ) {}

    /** Deliberately excludes passwordHash — never expose it, even to admins. */
    public record PatientView(
            UUID id, String fullName, String email, String phone, boolean enabled, Instant createdAt
    ) {}
}