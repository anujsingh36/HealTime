package io.healtime.controller;

import io.healtime.dto.PrescriptionDtos.*;
import io.healtime.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService service;

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/doctor/prescriptions")
    public PrescriptionView create(@Valid @RequestBody CreateRequest req) { return service.create(req); }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/prescriptions")
    public List<PrescriptionView> mine() { return service.mine(); }

    @GetMapping("/appointments/{id}/prescriptions")
    public List<PrescriptionView> forAppointment(@PathVariable UUID id) { return service.forAppointment(id); }
}
