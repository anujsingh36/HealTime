package io.healtime.repository;

import io.healtime.entity.Appointment;
import io.healtime.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findAllByPatientIdOrderByScheduledAtDesc(UUID patientId);
    List<Appointment> findAllByDoctorIdOrderByScheduledAtAsc(UUID doctorId);

    @Query("""
       select a from Appointment a
       where a.doctor.id = :doctorId
         and a.scheduledAt between :from and :to
         and a.status in :statuses
       order by a.scheduledAt asc
    """)
    List<Appointment> findQueue(@Param("doctorId") UUID doctorId,
                                @Param("from") Instant from,
                                @Param("to") Instant to,
                                @Param("statuses") List<AppointmentStatus> statuses);

    long countByDoctorIdAndScheduledAtBetween(UUID doctorId, Instant from, Instant to);
    long countByStatus(AppointmentStatus status);

    boolean existsByDoctorIdAndScheduledAtAndStatusNot(UUID doctorId, Instant scheduledAt, AppointmentStatus status);

    @Query("""
       select a from Appointment a
       where a.doctor.id = :doctorId
         and a.status in :statuses
         and a.scheduledAt >= :from and a.scheduledAt < :to
       order by a.scheduledAt asc
    """)
    List<Appointment> findActiveByDoctorAndDayOrderByScheduledAt(@Param("doctorId") UUID doctorId,
                                                                 @Param("from") Instant from,
                                                                 @Param("to") Instant to,
                                                                 @Param("statuses") List<AppointmentStatus> statuses);

    @Query("""
       select a from Appointment a
       where a.doctor.id = :doctorId
         and a.status = io.healtime.entity.AppointmentStatus.COMPLETED
         and a.startedAt is not null and a.completedAt is not null
       order by a.completedAt desc
    """)
    List<Appointment> findRecentCompleted(@Param("doctorId") UUID doctorId);

    @Query("""
       select a from Appointment a
       where a.status in :statuses
         and a.patientLat is not null and a.patientLng is not null
         and a.leaveNotified = false
    """)
    List<Appointment> findActiveWithLocationPendingLeaveNotice(@Param("statuses") List<AppointmentStatus> statuses);
}