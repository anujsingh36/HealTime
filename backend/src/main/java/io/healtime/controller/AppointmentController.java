package io.healtime.controller;

import io.healtime.dto.AppointmentDtos.*;
import io.healtime.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService service;

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping("/patient/appointments")
    public AppointmentView book(@Valid @RequestBody BookRequest req) { return service.book(req); }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/appointments")
    public List<AppointmentView> mine() { return service.myAppointments(); }

    @PreAuthorize("hasRole('PATIENT')")
    @DeleteMapping("/patient/appointments/{id}")
    public void cancel(@PathVariable UUID id) { service.cancel(id); }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/appointments/{id}/queue")
    public QueueView queue(@PathVariable UUID id) { return service.myQueuePosition(id); }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/doctor/appointments")
    public List<AppointmentView> doctorList() { return service.doctorAppointments(); }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/doctor/queue")
    public List<QueueView> doctorQueue() { return service.doctorQueue(); }

    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @PatchMapping("/doctor/appointments/{id}/status")
    public AppointmentView status(@PathVariable UUID id, @Valid @RequestBody StatusUpdate req) {
        return service.updateStatus(id, req);
    }
}
