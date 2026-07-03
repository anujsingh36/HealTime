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
        String phone,
        @NotNull Role role
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, UserSummary user) {}

    public record UserSummary(UUID id, String email, String fullName, Set<Role> roles, String avatarUrl) {}
}
