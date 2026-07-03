package io.healtime.controller;

import io.healtime.dto.DoctorDtos.SpecializationView;
import io.healtime.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specializations")
@RequiredArgsConstructor
public class SpecializationController {
    private final DoctorService doctors;
    @GetMapping public List<SpecializationView> list() { return doctors.specializations(); }
}
