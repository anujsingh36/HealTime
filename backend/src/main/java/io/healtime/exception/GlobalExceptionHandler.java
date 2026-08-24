package io.healtime.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> handle(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(body(ex.getStatus().value(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handle(MethodArgumentNotValidException ex) {
        Map<String,String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(f -> f.getField(), f -> f.getDefaultMessage(), (a,b)->a));
        Map<String,Object> body = body(400, "Validation failed");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Thrown when a @PathVariable/@RequestParam can't be converted to its target type — most
     * commonly an invalid UUID in a URL like /api/patient/appointments/not-a-uuid/queue. This is
     * a malformed request from the client, so it should be a 400, not fall through to the
     * generic 500 handler below.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handle(MethodArgumentTypeMismatchException ex) {
        String expected = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "the expected type";
        return ResponseEntity.badRequest().body(body(400,
                "Invalid value for '" + ex.getName() + "': expected " + expected));
    }

    /** Malformed/unparseable JSON request body. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handle(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(body(400, "Malformed request body"));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<?> handle(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest().body(body(400, "Missing required parameter: " + ex.getParameterName()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handle(AccessDeniedException ex) {
        return ResponseEntity.status(403).body(body(403, "Forbidden"));
    }

    /**
     * True catch-all for anything genuinely unexpected. The full exception is logged server-side
     * for debugging, but the client only gets a generic message — echoing ex.getMessage() back
     * to callers for arbitrary exceptions can leak internal details (SQL, file paths, stack
     * traces) that shouldn't be exposed over the API.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handle(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(500).body(body(500, "Something went wrong. Please try again."));
    }

    private Map<String,Object> body(int status, String message) {
        Map<String,Object> m = new HashMap<>();
        m.put("timestamp", Instant.now().toString());
        m.put("status", status);
        m.put("message", message);
        return m;
    }
}