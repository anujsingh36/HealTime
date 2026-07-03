package io.healtime.dto;

public class AdminDtos {
    public record DashboardStats(
        long totalPatients,
        long totalDoctors,
        long totalAppointments,
        long appointmentsToday,
        long pendingAppointments,
        long completedAppointments
    ) {}
}
