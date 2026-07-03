package io.healtime.controller;

import io.healtime.dto.AdminDtos.DashboardStats;
import io.healtime.entity.Role;
import io.healtime.repository.DoctorRepository;
import io.healtime.repository.UserRepository;
import io.healtime.service.AdminService;
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
    private final UserRepository users;
    private final DoctorRepository doctors;

    @GetMapping("/stats") public DashboardStats stats() { return admin.stats(); }

    @GetMapping("/patients")
    public Object patients() { return users.findAllByRolesContaining(Role.PATIENT); }

    @GetMapping("/doctors") public Object allDoctors() { return doctors.findAll(); }

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
