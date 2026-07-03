package io.healtime.service;

import io.healtime.dto.PrescriptionDtos.*;
import io.healtime.entity.*;
import io.healtime.exception.ApiException;
import io.healtime.repository.AppointmentRepository;
import io.healtime.repository.DoctorRepository;
import io.healtime.repository.PrescriptionRepository;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptions;
    private final AppointmentRepository appointments;
    private final DoctorRepository doctors;
    private final NotificationService notifications;
    private final SecurityUtils security;

    public PrescriptionView create(CreateRequest req) {
        Appointment a = appointments.findById(req.appointmentId())
            .orElseThrow(() -> ApiException.notFound("Appointment"));
        Doctor d = doctors.findByUserId(security.currentUser().getId())
            .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        if (!a.getDoctor().getId().equals(d.getId()))
            throw ApiException.forbidden("You can only prescribe for your own appointments");
        Prescription p = Prescription.builder()
            .appointment(a).doctor(d).patient(a.getPatient())
            .diagnosis(req.diagnosis()).instructions(req.instructions())
            .medications(req.medications()).fileUrl(req.fileUrl())
            .build();
        prescriptions.save(p);
        notifications.push(a.getPatient(), NotificationType.PRESCRIPTION,
            "New prescription", "Dr. " + d.getUser().getFullName() + " added a prescription.",
            "/patient/prescriptions");
        return toView(p);
    }

    public List<PrescriptionView> mine() {
        return prescriptions.findAllByPatientIdOrderByCreatedAtDesc(security.currentUser().getId())
            .stream().map(this::toView).toList();
    }

    public List<PrescriptionView> forAppointment(UUID appointmentId) {
        return prescriptions.findAllByAppointmentId(appointmentId).stream().map(this::toView).toList();
    }

    private PrescriptionView toView(Prescription p) {
        return new PrescriptionView(p.getId(), p.getAppointment().getId(), p.getDiagnosis(),
            p.getInstructions(), p.getMedications(), p.getFileUrl(), p.getCreatedAt());
    }
}
