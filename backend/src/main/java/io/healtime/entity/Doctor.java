package io.healtime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity @Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "specialization_id", nullable = false)
    private Specialization specialization;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    private Integer yearsExperience;

    @Column(columnDefinition = "text")
    private String bio;

    private BigDecimal consultationFee;
    private String clinicName;
    private String location;

    /** Optional manual fallback (minutes) used when there isn't enough completed-appointment
     *  history yet to compute a real average consultation duration. */
    private Integer avgConsultationMin;

    /** Clinic coordinates, used to estimate patient travel time for "time to leave" notifications. */
    private Double clinicLat;
    private Double clinicLng;

    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    private boolean verified = false;
}