package io.healtime.service;

import io.healtime.dto.DoctorDtos.*;
import io.healtime.entity.Doctor;
import io.healtime.entity.DoctorAvailability;
import io.healtime.entity.Specialization;
import io.healtime.exception.ApiException;
import io.healtime.repository.AvailabilityRepository;
import io.healtime.repository.DoctorRepository;
import io.healtime.repository.SpecializationRepository;
import io.healtime.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctors;
    private final AvailabilityRepository availability;
    private final SpecializationRepository specs;
    private final SecurityUtils security;

    @Transactional(readOnly = true)
    public Page<DoctorView> search(String specSlug, String q, int page, int size) {
        return doctors.search(specSlug, q, PageRequest.of(page, size)).map(this::toView);
    }

    @Transactional(readOnly = true)
    public DoctorView get(UUID id) {
        return toView(doctors.findById(id).orElseThrow(() -> ApiException.notFound("Doctor")));
    }

    /**
     * Full doctor list including unverified ones, for the admin panel — verified/unverified
     * doctors both need to show up here (search() intentionally doesn't filter by verified
     * either, but this is used by admin, not the public "Find a Doctor" search).
     */
    @Transactional(readOnly = true)
    public List<DoctorView> listAll() {
        return doctors.findAll().stream().map(this::toView).toList();
    }

    public List<SpecializationView> specializations() {
        return specs.findAll().stream()
                .map(s -> new SpecializationView(s.getId(), s.getName(), s.getSlug(), s.getDescription(), s.getIcon()))
                .toList();
    }

    @Transactional
    public DoctorView updateOwnProfile(DoctorUpdateRequest req) {
        Doctor d = doctors.findByUserId(security.currentUser().getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        if (req.specializationId() != null) {
            Specialization s = specs.findById(req.specializationId()).orElseThrow(() -> ApiException.notFound("Specialization"));
            d.setSpecialization(s);
        }
        if (req.licenseNumber() != null) d.setLicenseNumber(req.licenseNumber());
        if (req.yearsExperience() != null) d.setYearsExperience(req.yearsExperience());
        if (req.bio() != null) d.setBio(req.bio());
        if (req.consultationFee() != null) d.setConsultationFee(req.consultationFee());
        if (req.clinicName() != null) d.setClinicName(req.clinicName());
        if (req.location() != null) d.setLocation(req.location());
        if (req.avgConsultationMin() != null) d.setAvgConsultationMin(req.avgConsultationMin());
        if (req.clinicLat() != null) d.setClinicLat(req.clinicLat());
        if (req.clinicLng() != null) d.setClinicLng(req.clinicLng());
        return toView(doctors.save(d));
    }

    public List<AvailabilitySlot> getAvailability(UUID doctorId) {
        return availability.findAllByDoctorId(doctorId).stream()
                .map(a -> new AvailabilitySlot(a.getDayOfWeek(), a.getStartTime(), a.getEndTime(), a.getSlotDurationMin()))
                .toList();
    }

    @Transactional
    public void setOwnAvailability(AvailabilityUpdateRequest req) {
        Doctor d = doctors.findByUserId(security.currentUser().getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile"));
        availability.deleteAllByDoctorId(d.getId());
        req.slots().forEach(s -> availability.save(DoctorAvailability.builder()
                .doctor(d).dayOfWeek(s.dayOfWeek())
                .startTime(s.startTime()).endTime(s.endTime())
                .slotDurationMin(s.slotDurationMin()).build()));
    }

    private DoctorView toView(Doctor d) {
        return new DoctorView(
                d.getId(), d.getUser().getId(), d.getUser().getFullName(), d.getUser().getEmail(), d.getUser().getAvatarUrl(),
                d.getSpecialization().getName(), d.getSpecialization().getSlug(),
                d.getLicenseNumber(), d.getYearsExperience(), d.getBio(),
                d.getConsultationFee(), d.getClinicName(), d.getLocation(),
                d.getRating(), d.isVerified(),
                d.getAvgConsultationMin(), d.getClinicLat(), d.getClinicLng());
    }
}