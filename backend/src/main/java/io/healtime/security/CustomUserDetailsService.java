package io.healtime.security;

import io.healtime.entity.User;
import io.healtime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User u = users.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("No user: " + email));
        return new org.springframework.security.core.userdetails.User(
            u.getEmail(), u.getPasswordHash(), u.isEnabled(), true, true, true,
            u.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).toList());
    }
}
