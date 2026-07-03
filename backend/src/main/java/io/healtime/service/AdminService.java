package io.healtime.service;

import io.healtime.dto.AdminDtos.DashboardStats;
import io.healtime.entity.AppointmentStatus;
import io.healtime.entity.Role;
import io.healtime.repository.AppointmentRepository;
import io.healtime.repository.DoctorRepository;
import io.healtime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository users;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;

    public DashboardStats stats() {
        Instant dayStart = LocalDate.now().atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant dayEnd = dayStart.plus(Duration.ofDays(1));
        return new DashboardStats(
            users.findAllByRolesContaining(Role.PATIENT).size(),
            doctors.count(),
            appointments.count(),
            appointments.findAll().stream()
                .filter(a -> !a.getScheduledAt().isBefore(dayStart) && a.getScheduledAt().isBefore(dayEnd)).count(),
            appointments.countByStatus(AppointmentStatus.PENDING),
            appointments.countByStatus(AppointmentStatus.COMPLETED));
    }
}
