package io.healtime.controller;

import io.healtime.dto.AdminDtos.DashboardStats;
import io.healtime.dto.AdminDtos.PatientView;
import io.healtime.dto.DoctorDtos.DoctorView;
import io.healtime.repository.DoctorRepository;
import io.healtime.repository.UserRepository;
import io.healtime.service.AdminService;
import io.healtime.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService admin;
    private final DoctorService doctorService;
    private final UserRepository users;
    private final DoctorRepository doctors;

    @GetMapping("/stats") public DashboardStats stats() { return admin.stats(); }

    @GetMapping("/patients")
    public List<PatientView> patients() { return admin.listPatients(); }

    @GetMapping("/doctors")
    public List<DoctorView> allDoctors() { return doctorService.listAll(); }

    @PostMapping("/doctors/{id}/verify")
    public void verify(@PathVariable UUID id) {
        var d = doctors.findById(id).orElseThrow();
        d.setVerified(true); doctors.save(d);
    }

    @PostMapping("/users/{id}/disable")
    public void disable(@PathVariable UUID id) {
        var u = users.findById(id).orElseThrow();
        u.setEnabled(false); users.save(u);
    }
}