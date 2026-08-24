package io.healtime.service;

import io.healtime.dto.AdminDtos.DashboardStats;
import io.healtime.dto.AdminDtos.PatientView;
import io.healtime.entity.AppointmentStatus;
import io.healtime.entity.Role;
import io.healtime.repository.AppointmentRepository;
import io.healtime.repository.DoctorRepository;
import io.healtime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;

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

    /** Deliberately maps to a DTO — never return raw User entities (would leak passwordHash). */
    @Transactional(readOnly = true)
    public List<PatientView> listPatients() {
        return users.findAllByRolesContaining(Role.PATIENT).stream()
                .map(u -> new PatientView(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.isEnabled(), u.getCreatedAt()))
                .toList();
    }
}