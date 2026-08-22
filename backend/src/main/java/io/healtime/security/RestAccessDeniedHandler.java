package io.healtime.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

/**
 * Without an explicit AccessDeniedHandler, Spring Security's default handler calls
 * response.sendError(403), which triggers an internal Servlet forward to "/error".
 * Our JwtAuthFilter (a OncePerRequestFilter) skips ERROR-dispatch requests by default,
 * so the Authorization header never gets re-processed on that forwarded request — the
 * re-evaluated security context ends up unauthenticated, and the response comes back as
 * 401 instead of the correct 403. Writing the response directly here (no sendError/forward)
 * avoids that entirely and returns a proper, immediate 403.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException ex) throws IOException {
        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
        res.setContentType("application/json");
        mapper.writeValue(res.getOutputStream(), Map.of(
            "timestamp", Instant.now().toString(),
            "status", 403,
            "error", "Forbidden",
            "message", "You don't have permission to access this resource",
            "path", req.getRequestURI()));
    }
}