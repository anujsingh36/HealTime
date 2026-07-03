package io.healtime.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "specializations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Specialization extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;
    @Column(nullable = false, unique = true)
    private String slug;
    private String description;
    private String icon;
}
