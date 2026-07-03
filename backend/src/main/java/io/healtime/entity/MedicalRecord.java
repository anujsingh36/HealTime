package io.healtime.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "medical_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(nullable = false) private String title;
    private String recordType;
    @Column(nullable = false) private String fileUrl;
    private Long fileSize;
    @Column(columnDefinition = "text") private String notes;
}
