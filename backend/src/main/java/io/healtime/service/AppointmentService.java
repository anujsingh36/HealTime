package io.healtime.service;

import io.healtime.dto.AppointmentDtos.*;
import io.healtime.entity.*;
import io.healtime.exception.ApiException;
import io.healtime.repository.AppointmentRepository;
import io.healtime.repository.AvailabilityRepository;
import io.healtime.repository.DoctorRepository;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);

    /** Used only until a doctor has enough real history to compute an actual average. */
    private static final int DEFAULT_SLOT_MIN = 15;
    /** How many of the doctor's most recent completed consultations to average over. */
    private static final int AVG_WINDOW = 5;
    /**
     * Sanity cap on a single consultation's duration when computing the average. Real
     * consultations are short; anything longer almost always means the appointment was left
     * "In Progress" and forgotten (e.g. completed a day later) rather than a genuinely long
     * visit. Without this cap, one such outlier could blow the whole queue's estimated wait
     * time up to hundreds/thousands of minutes.
     */
    private static final int MAX_REASONABLE_CONSULT_MIN = 120;
    /** Assumed average travel speed (km/h) for the Haversine-based ETA estimate. */
    private static final double ASSUMED_TRAVEL_SPEED_KMH = 25.0;
    /** Extra minutes of buffer added on top of the raw travel-time estimate. */
    private static final int TRAVEL_BUFFER_MIN = 5;

    /**
     * Single timezone used everywhere "day of week" / "start of day" is interpreted — doctor
     * availability, patient bookings, and the live queue are all reasoned about in this zone,
     * NOT UTC. Without this, comparing a scheduled Instant's wall-clock time directly against a
     * doctor's local working hours (e.g. 09:00–17:00) after converting via ZoneOffset.UTC would
     * be off by the zone's offset (+05:30 for India) — a booking made at 10:00 AM local time
     * would be seen as 04:30 UTC and wrongly rejected as "outside working hours".
     */
    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    private static final List<AppointmentStatus> ACTIVE_STATUSES =
            List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS);

    private final AppointmentRepository appointments;
    private final DoctorRepository doctors;
    private final AvailabilityRepository availabilities;
    private final SecurityUtils security;
    private final NotificationService notifications;

    @Transactional
    public AppointmentView book(BookRequest req) {
        User patient = security.currentUser();
        Doctor doctor = doctors.findById(req.doctorId())
                .orElseThrow(() -> ApiException.notFound("Doctor"));

        boolean slotTaken = appointments.existsByDoctorIdAndScheduledAtAndStatusNot(
                doctor.getId(), req.scheduledAt(), AppointmentStatus.CANCELLED);
        if (slotTaken) {
            throw ApiException.conflict("This time slot is already booked. Please choose another slot.");
        }

        validateWithinAvailability(doctor, req.scheduledAt());

        Appointment a = Appointment.builder()
                .patient(patient).doctor(doctor)
                .scheduledAt(req.scheduledAt())
                .reason(req.reason())
                .status(AppointmentStatus.CONFIRMED)
                .queuePosition(null)
                .estimatedWaitMin(null)
                .build();
        appointments.save(a);

        // Assign this appointment's live-queue position/wait by recalculating the whole day's
        // active queue for this doctor — this is the single source of truth for positions,
        // so a fresh booking is always numbered consistently with everyone already waiting.
        recalcQueueForDay(doctor, req.scheduledAt());

        notifications.push(patient, NotificationType.APPOINTMENT, "Appointment booked",
                "Your appointment with Dr. " + doctor.getUser().getFullName() + " is confirmed.",
                "/patient/appointments");
        notifications.push(doctor.getUser(), NotificationType.APPOINTMENT, "New appointment",
                patient.getFullName() + " booked an appointment.", "/doctor/appointments");
        return toView(a);
    }

    /**
     * Confirms the requested slot actually falls within a window the doctor has published as
     * available (day of week + time range). Without this, booking only ever checked for a
     * double-booked slot — a patient could book any date/time at all, including days the doctor
     * never set as working days, or hours outside their listed schedule.
     */
    private void validateWithinAvailability(Doctor doctor, Instant scheduledAt) {
        ZonedDateTime zdt = scheduledAt.atZone(APP_ZONE);
        DayOfWeek day = zdt.getDayOfWeek();
        LocalTime time = zdt.toLocalTime();

        List<DoctorAvailability> daySlots = availabilities.findAllByDoctorId(doctor.getId()).stream()
                .filter(a -> a.getDayOfWeek() == day)
                .toList();
        if (daySlots.isEmpty()) {
            throw ApiException.badRequest(
                    "Dr. " + doctor.getUser().getFullName() + " is not available on " + day + ".");
        }
        boolean withinWindow = daySlots.stream().anyMatch(a ->
                !time.isBefore(a.getStartTime()) && time.isBefore(a.getEndTime()));
        if (!withinWindow) {
            throw ApiException.badRequest(
                    "That time is outside Dr. " + doctor.getUser().getFullName() + "'s available hours on " + day + ".");
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentView> myAppointments() {
        User me = security.currentUser();
        return appointments.findAllByPatientIdOrderByScheduledAtDesc(me.getId())
                .stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentView> doctorAppointments() {
        Doctor d = doctors.findByUserId(security.currentUser().getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        return appointments.findAllByDoctorIdOrderByScheduledAtAsc(d.getId())
                .stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public List<QueueView> doctorQueue() {
        Doctor d = doctors.findByUserId(security.currentUser().getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        Instant from = LocalDate.now(APP_ZONE).atStartOfDay(APP_ZONE).toInstant();
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
        AppointmentStatus previous = a.getStatus();
        a.setStatus(req.status());
        if (req.notes() != null) a.setNotes(req.notes());

        Instant now = Instant.now();
        if (req.status() == AppointmentStatus.IN_PROGRESS && a.getStartedAt() == null) {
            a.setStartedAt(now);
        }
        if (req.status() == AppointmentStatus.COMPLETED && a.getCompletedAt() == null) {
            a.setCompletedAt(now);
            if (a.getStartedAt() == null) a.setStartedAt(now); // safety net if "start" step was skipped
        }
        appointments.save(a);

        String notifTitle = req.status() == AppointmentStatus.IN_PROGRESS
                ? "It's your turn!"
                : "Appointment " + req.status().name().toLowerCase().replace('_',' ');
        String notifBody = req.status() == AppointmentStatus.IN_PROGRESS
                ? "Dr. " + a.getDoctor().getUser().getFullName() + " is ready to see you now."
                : "Status updated for your appointment.";
        notifications.push(a.getPatient(), NotificationType.QUEUE, notifTitle, notifBody, "/patient/appointments");

        // Once a slot frees up (completed/cancelled/no-show), everyone still waiting behind it
        // on that SAME day should move up — recompute the live queue for just that day.
        boolean freedSlot = previous != req.status() && (
                req.status() == AppointmentStatus.COMPLETED ||
                        req.status() == AppointmentStatus.CANCELLED ||
                        req.status() == AppointmentStatus.NO_SHOW);
        if (freedSlot) {
            recalcQueueForDay(a.getDoctor(), a.getScheduledAt());
        }
        return toView(a);
    }

    @Transactional
    public void cancel(UUID id) {
        Appointment a = appointments.findById(id).orElseThrow(() -> ApiException.notFound("Appointment"));
        User me = security.currentUser();
        if (!a.getPatient().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your appointment");
        a.setStatus(AppointmentStatus.CANCELLED);
        appointments.save(a);
        recalcQueueForDay(a.getDoctor(), a.getScheduledAt());
    }

    @Transactional(readOnly = true)
    public QueueView myQueuePosition(UUID appointmentId) {
        Appointment a = appointments.findById(appointmentId).orElseThrow(() -> ApiException.notFound("Appointment"));
        User me = security.currentUser();
        if (!a.getPatient().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your appointment");
        return new QueueView(a.getId(), a.getQueuePosition(), a.getEstimatedWaitMin(), a.getStatus());
    }

    /**
     * Patient shares their live location while waiting (browser Geolocation API on the frontend
     * calls this periodically). Used to estimate travel time for the "time to leave" notification.
     */
    @Transactional
    public void updateMyLocation(UUID appointmentId, double lat, double lng) {
        Appointment a = appointments.findById(appointmentId).orElseThrow(() -> ApiException.notFound("Appointment"));
        User me = security.currentUser();
        if (!a.getPatient().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your appointment");
        a.setPatientLat(lat);
        a.setPatientLng(lng);
        a.setPatientLocationUpdatedAt(Instant.now());
        appointments.save(a);
    }

    /**
     * Re-ranks a doctor's remaining active (not yet completed/cancelled/no-show) appointments
     * for ONE specific calendar day (the day of {@code referenceInstant}), in chronological
     * order, and recomputes each person's estimated wait using the doctor's real recent average
     * consultation duration. This is the single place queue positions/waits get assigned —
     * called both right after a new booking and whenever an earlier slot frees up — so a
     * doctor's queue is always scoped to that day only, and never inflated by cancelled/other
     * days' appointments.
     */
    @Transactional
    public void recalcQueueForDay(Doctor doctor, Instant referenceInstant) {
        Instant dayStart = referenceInstant.atZone(APP_ZONE).toLocalDate()
                .atStartOfDay(APP_ZONE).toInstant();
        Instant dayEnd = dayStart.plus(Duration.ofDays(1));
        List<Appointment> active = appointments.findActiveByDoctorAndDayOrderByScheduledAt(
                doctor.getId(), dayStart, dayEnd, ACTIVE_STATUSES);
        int avgMin = averageConsultationMinutes(doctor);
        for (int i = 0; i < active.size(); i++) {
            Appointment a = active.get(i);
            a.setQueuePosition(i + 1);
            a.setEstimatedWaitMin(i * avgMin);
        }
        appointments.saveAll(active);
    }

    /**
     * Real average consultation duration, computed from this doctor's most recent completed
     * appointments (started_at -> completed_at). Falls back to the doctor's manually-set
     * average if there isn't enough history yet, and finally to a generic default.
     */
    private int averageConsultationMinutes(Doctor doctor) {
        List<Appointment> recent = appointments.findRecentCompleted(doctor.getId());
        if (!recent.isEmpty()) {
            int windowSize = Math.min(AVG_WINDOW, recent.size());
            double totalMin = recent.stream()
                    .limit(windowSize)
                    .mapToLong(a -> Duration.between(a.getStartedAt(), a.getCompletedAt()).toMinutes())
                    .filter(m -> m > 0 && m <= MAX_REASONABLE_CONSULT_MIN)
                    .average()
                    .orElse(0);
            if (totalMin > 0) return (int) Math.round(totalMin);
        }
        if (doctor.getAvgConsultationMin() != null && doctor.getAvgConsultationMin() > 0) {
            return doctor.getAvgConsultationMin();
        }
        return DEFAULT_SLOT_MIN;
    }

    /**
     * Runs every 2 minutes. For every active appointment where the patient has shared their
     * live location, estimates travel time (Haversine distance to the clinic + assumed average
     * speed) and, once "time until your turn" is about to run out, sends a one-time
     * "time to leave" notification so the patient arrives just as their turn comes up.
     */
    @Scheduled(fixedRate = 2 * 60 * 1000)
    @Transactional
    public void checkLeaveByNotifications() {
        List<Appointment> candidates = appointments.findActiveWithLocationPendingLeaveNotice(ACTIVE_STATUSES);
        for (Appointment a : candidates) {
            Doctor doctor = a.getDoctor();
            if (doctor.getClinicLat() == null || doctor.getClinicLng() == null) continue;
            if (a.getEstimatedWaitMin() == null) continue;

            double distanceKm = haversineKm(a.getPatientLat(), a.getPatientLng(),
                    doctor.getClinicLat(), doctor.getClinicLng());
            int travelMin = (int) Math.round((distanceKm / ASSUMED_TRAVEL_SPEED_KMH) * 60) + TRAVEL_BUFFER_MIN;

            if (travelMin >= a.getEstimatedWaitMin()) {
                notifications.push(a.getPatient(), NotificationType.QUEUE,
                        "Time to leave!",
                        "It should take you about " + travelMin + " min to reach Dr. " +
                                doctor.getUser().getFullName() + "'s clinic — head out now to arrive on time.",
                        "/patient/queue");
                a.setLeaveNotified(true);
                appointments.save(a);
                log.info("Sent 'time to leave' notification for appointment {} (travel~{}min, wait~{}min)",
                        a.getId(), travelMin, a.getEstimatedWaitMin());
            }
        }
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double r = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }

    private AppointmentView toView(Appointment a) {
        return new AppointmentView(
                a.getId(), a.getDoctor().getId(), a.getDoctor().getUser().getFullName(),
                a.getDoctor().getSpecialization().getName(),
                a.getPatient().getId(), a.getPatient().getFullName(),
                a.getScheduledAt(), a.getStatus(),
                a.getQueuePosition(), a.getEstimatedWaitMin(),
                a.getReason(), a.getNotes(), a.isLeaveNotified());
    }
}