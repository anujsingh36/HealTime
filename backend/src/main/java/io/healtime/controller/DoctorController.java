package io.healtime.controller;

import io.healtime.dto.DoctorDtos.*;
import io.healtime.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctors;

    @GetMapping("/search")
    public Page<DoctorView> search(@RequestParam(required = false) String spec,
                                   @RequestParam(required = false) String q,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "12") int size) {
        return doctors.search(spec, q, page, size);
    }

    @GetMapping("/{id}")
    public DoctorView get(@PathVariable UUID id) { return doctors.get(id); }

    @GetMapping("/{id}/availability")
    public List<AvailabilitySlot> availability(@PathVariable UUID id) { return doctors.getAvailability(id); }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/me")
    public DoctorView updateMe(@RequestBody DoctorUpdateRequest req) { return doctors.updateOwnProfile(req); }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/me/availability")
    public void setAvailability(@Valid @RequestBody AvailabilityUpdateRequest req) {
        doctors.setOwnAvailability(req);
    }
}
