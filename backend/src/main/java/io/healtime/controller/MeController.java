package io.healtime.controller;

import io.healtime.dto.AuthDtos.UserSummary;
import io.healtime.entity.User;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {
    private final SecurityUtils security;

    @GetMapping
    public UserSummary me() {
        User u = security.currentUser();
        return new UserSummary(u.getId(), u.getEmail(), u.getFullName(), u.getRoles(), u.getAvatarUrl());
    }
}
