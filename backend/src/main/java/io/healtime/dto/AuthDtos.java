package io.healtime.dto;

import io.healtime.entity.Role;
import jakarta.validation.constraints.*;

import java.util.Set;
import java.util.UUID;

public class AuthDtos {

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank String fullName,
            @Pattern(regexp = "^[+]?[0-9\\s-]{7,15}$", message = "Enter a valid phone number")
            String phone,
            @NotNull Role role,
            // Required only when role == DOCTOR
            UUID specializationId,
            String licenseNumber
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, UserSummary user) {}

    public record UserSummary(UUID id, String email, String fullName, Set<Role> roles, String avatarUrl) {}
}