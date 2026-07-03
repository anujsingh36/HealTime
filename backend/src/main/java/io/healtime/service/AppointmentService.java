package io.healtime.service;

import io.healtime.dto.AppointmentDtos.*;
import io.healtime.entity.*;
import io.healtime.exception.ApiException;
import io.healtime.repository.AppointmentRepository;
import io.healtime.repository.DoctorRepository;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final int DEFAULT_SLOT_MIN = 15;

    private final AppointmentRepository appointments;
    private final DoctorRepository doctors;
    private final SecurityUtils security;
    private final NotificationService notifications;

    @Transactional
    public AppointmentView book(BookRequest req) {
        User patient = security.currentUser();
        Doctor doctor = doctors.findById(req.doctorId())
            .orElseThrow(() -> ApiException.notFound("Doctor"));

        Instant dayStart = req.scheduledAt().atZone(ZoneOffset.UTC).toLocalDate()
            .atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant dayEnd = dayStart.plus(Duration.ofDays(1));
        long position = appointments.countByDoctorIdAndScheduledAtBetween(doctor.getId(), dayStart, dayEnd) + 1;

        Appointment a = Appointment.builder()
            .patient(patient).doctor(doctor)
            .scheduledAt(req.scheduledAt())
            .reason(req.reason())
            .status(AppointmentStatus.CONFIRMED)
            .queuePosition((int) position)
            .estimatedWaitMin((int) ((position - 1) * DEFAULT_SLOT_MIN))
            .build();
        appointments.save(a);

        notifications.push(patient, NotificationType.APPOINTMENT, "Appointment booked",
            "Your appointment with Dr. " + doctor.getUser().getFullName() + " is confirmed.",
            "/patient/appointments");
        notifications.push(doctor.getUser(), NotificationType.APPOINTMENT, "New appointment",
            patient.getFullName() + " booked an appointment.", "/doctor/appointments");
        return toView(a);
    }

    public List<AppointmentView> myAppointments() {
        User me = security.currentUser();
        return appointments.findAllByPatientIdOrderByScheduledAtDesc(me.getId())
            .stream().map(this::toView).toList();
    }

    public List<AppointmentView> doctorAppointments() {
        Doctor d = doctors.findByUserId(security.currentUser().getId())
            .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        return appointments.findAllByDoctorIdOrderByScheduledAtAsc(d.getId())
            .stream().map(this::toView).toList();
    }

    public List<QueueView> doctorQueue() {
        Doctor d = doctors.findByUserId(security.currentUser().getId())
            .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        Instant from = LocalDate.now().atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = from.plus(Duration.ofDays(1));
        return appointments.findQueue(d.getId(), from, to,
                List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.PENDING))
            .stream()
            .map(a -> new QueueView(a.getId(), a.getQueuePosition(), a.getEstimatedWaitMin(), a.getStatus()))
            .toList();
    }

    @Transactional
    public AppointmentView updateStatus(UUID id, StatusUpdate req) {
        Appointment a = appointments.findById(id).orElseThrow(() -> ApiException.notFound("Appointment"));
        a.setStatus(req.status());
        if (req.notes() != null) a.setNotes(req.notes());
        notifications.push(a.getPatient(), NotificationType.QUEUE,
            "Appointment " + req.status().name().toLowerCase().replace('_',' '),
            "Status updated for your appointment.", "/patient/appointments");
        return toView(appointments.save(a));
    }

    @Transactional
    public void cancel(UUID id) {
        Appointment a = appointments.findById(id).orElseThrow(() -> ApiException.notFound("Appointment"));
        User me = security.currentUser();
        if (!a.getPatient().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your appointment");
        a.setStatus(AppointmentStatus.CANCELLED);
        appointments.save(a);
    }

    public QueueView myQueuePosition(UUID appointmentId) {
        Appointment a = appointments.findById(appointmentId).orElseThrow(() -> ApiException.notFound("Appointment"));
        return new QueueView(a.getId(), a.getQueuePosition(), a.getEstimatedWaitMin(), a.getStatus());
    }

    private AppointmentView toView(Appointment a) {
        return new AppointmentView(
            a.getId(), a.getDoctor().getId(), a.getDoctor().getUser().getFullName(),
            a.getDoctor().getSpecialization().getName(),
            a.getPatient().getId(), a.getPatient().getFullName(),
            a.getScheduledAt(), a.getStatus(),
            a.getQueuePosition(), a.getEstimatedWaitMin(),
            a.getReason(), a.getNotes());
    }
}
