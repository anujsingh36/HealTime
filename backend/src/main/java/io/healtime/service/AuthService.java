package io.healtime.service;

import io.healtime.dto.AuthDtos.*;
import io.healtime.entity.Role;
import io.healtime.entity.User;
import io.healtime.exception.ApiException;
import io.healtime.repository.UserRepository;
import io.healtime.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email())) throw ApiException.conflict("Email already registered");
        if (req.role() == Role.ADMIN) throw ApiException.forbidden("Admin accounts are provisioned manually");
        User u = User.builder()
            .email(req.email())
            .passwordHash(encoder.encode(req.password()))
            .fullName(req.fullName())
            .phone(req.phone())
            .roles(Set.of(req.role()))
            .build();
        users.save(u);
        return authenticate(new LoginRequest(req.email(), req.password()));
    }

    public AuthResponse authenticate(LoginRequest req) {
        var auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        UserDetails ud = (UserDetails) auth.getPrincipal();
        User u = users.findByEmail(req.email()).orElseThrow();
        return new AuthResponse(jwt.generateToken(ud),
            new UserSummary(u.getId(), u.getEmail(), u.getFullName(), u.getRoles(), u.getAvatarUrl()));
    }
}
