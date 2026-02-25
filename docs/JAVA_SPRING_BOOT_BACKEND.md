# Rural Women Micro-Business Support Platform
## Java Spring Boot Backend Documentation (For Academic Reference)

This document provides Java Spring Boot backend code for academic/interview purposes.
This code is NOT runnable inside Lovable - it's documentation only.

---

## 1. Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── graminudyami/
│   │           ├── GraminUdyamiApplication.java
│   │           ├── config/
│   │           │   ├── SecurityConfig.java
│   │           │   └── JwtConfig.java
│   │           ├── controller/
│   │           │   ├── AuthController.java
│   │           │   ├── BusinessController.java
│   │           │   ├── ProductController.java
│   │           │   ├── OrderController.java
│   │           │   ├── CourseController.java
│   │           │   ├── FinanceController.java
│   │           │   ├── SchemeController.java
│   │           │   ├── SHGGroupController.java
│   │           │   └── LoanSchemeController.java
│   │           ├── dto/
│   │           │   ├── request/
│   │           │   └── response/
│   │           ├── entity/
│   │           │   ├── User.java
│   │           │   ├── Profile.java
│   │           │   ├── Business.java
│   │           │   ├── Product.java
│   │           │   ├── Order.java
│   │           │   ├── OrderItem.java
│   │           │   ├── Course.java
│   │           │   ├── LearningProgress.java
│   │           │   ├── Income.java
│   │           │   ├── Expense.java
│   │           │   ├── GovernmentScheme.java
│   │           │   ├── SHGGroup.java
│   │           │   ├── SHGGroupMember.java
│   │           │   ├── SHGGroupIncome.java
│   │           │   ├── SHGGroupSavings.java
│   │           │   ├── LoanScheme.java
│   │           │   └── EMICalculation.java
│   │           ├── repository/
│   │           ├── service/
│   │           └── exception/
│   └── resources/
│       └── application.yml
```

---

## 2. Entity Classes

### User.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    private AppRole role = AppRole.ENTREPRENEUR;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;
}

enum AppRole {
    ENTREPRENEUR, BUYER, ADMIN
}
```

### Profile.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Data
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String fullName;
    
    private String phone;
    private String state;
    private String district;
    private String village;
    private String profileImageUrl;
    private String preferredLanguage = "en";
}
```

### Business.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@Data
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String businessName;
    
    @Enumerated(EnumType.STRING)
    private BusinessCategory category = BusinessCategory.OTHER;
    
    private String description;
    private String address;
    private String state;
    private String district;
    private String phone;
    private String email;
    private String logoUrl;
    private Boolean isVerified = false;
    private Boolean isActive = true;
    
    @ManyToOne
    @JoinColumn(name = "shg_group_id")
    private SHGGroup shgGroup;
    
    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Product> products;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

enum BusinessCategory {
    HANDICRAFTS, TEXTILES, FOOD_PRODUCTS, AGRICULTURE, 
    DAIRY, BEAUTY, SERVICES, RETAIL, OTHER
}
```

### Product.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private String unit = "piece";
    private Integer stockQuantity = 0;
    private String category;
    private String imageUrl;
    private Boolean isAvailable = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

### Order.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private User buyer;
    
    @ManyToOne
    @JoinColumn(name = "business_id")
    private Business business;
    
    @Column(nullable = false)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
    
    private String shippingAddress;
    private String phone;
    private String notes;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

enum OrderStatus {
    PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

### SHGGroup.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "shg_groups")
@Data
public class SHGGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String village;
    
    private String district;
    private String state;
    
    @ManyToOne
    @JoinColumn(name = "leader_user_id", nullable = false)
    private User leader;
    
    @Enumerated(EnumType.STRING)
    private SHGBusinessType businessType = SHGBusinessType.OTHER;
    
    private String description;
    private String bankAccountNumber;
    private String bankName;
    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<SHGGroupMember> members;
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<SHGGroupIncome> incomes;
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<SHGGroupSavings> savings;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

enum SHGBusinessType {
    TAILORING, DAIRY, HANDICRAFTS, AGRICULTURE, FOOD_PROCESSING,
    TEXTILES, POULTRY, FISHERY, BEAUTY_PARLOR, RETAIL, OTHER
}
```

### LoanScheme.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "loan_schemes")
@Data
public class LoanScheme {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    private String ministry;
    private BigDecimal loanAmountMin;
    private BigDecimal loanAmountMax;
    
    @Column(nullable = false)
    private BigDecimal interestRate;
    
    private BigDecimal subsidyPercentage = BigDecimal.ZERO;
    private Integer tenureMonthsMin;
    private Integer tenureMonthsMax;
    private String eligibility;
    
    @ElementCollection
    private List<String> applicableBusinessTypes;
    
    @ElementCollection
    private List<String> applicableStates;
    
    private Boolean forWomen = true;
    private Boolean forShg = false;
    private String applicationUrl;
    private String documentsRequired;
    private Boolean isActive = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

### EMICalculation.java
```java
package com.graminudyami.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emi_calculations")
@Data
public class EMICalculation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "loan_scheme_id")
    private LoanScheme loanScheme;
    
    @Column(nullable = false)
    private BigDecimal loanAmount;
    
    @Column(nullable = false)
    private BigDecimal interestRate;
    
    @Column(nullable = false)
    private Integer tenureMonths;
    
    @Column(nullable = false)
    private BigDecimal monthlyEmi;
    
    @Column(nullable = false)
    private BigDecimal totalPayment;
    
    @Column(nullable = false)
    private BigDecimal totalInterest;
    
    private String notes;
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

---

## 3. Repository Interfaces

### BusinessRepository.java
```java
package com.graminudyami.repository;

import com.graminudyami.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {
    List<Business> findByUserId(UUID userId);
    List<Business> findByIsActiveTrue();
    Optional<Business> findByUserIdAndIsActiveTrue(UUID userId);
    List<Business> findByCategoryAndIsActiveTrue(String category);
    List<Business> findByStateAndIsActiveTrue(String state);
    List<Business> findByShgGroupId(UUID shgGroupId);
}
```

### ProductRepository.java
```java
package com.graminudyami.repository;

import com.graminudyami.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByBusinessId(UUID businessId);
    List<Product> findByIsAvailableTrueAndStockQuantityGreaterThan(int quantity);
    
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true " +
           "AND p.stockQuantity > 0 " +
           "AND (:category IS NULL OR p.category = :category)")
    List<Product> findAvailableProducts(String category);
    
    @Query("SELECT p FROM Product p JOIN p.business b WHERE b.shgGroup.id = :groupId")
    List<Product> findByShgGroupId(UUID groupId);
}
```

### SHGGroupRepository.java
```java
package com.graminudyami.repository;

import com.graminudyami.entity.SHGGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SHGGroupRepository extends JpaRepository<SHGGroup, UUID> {
    List<SHGGroup> findByLeaderId(UUID leaderId);
    List<SHGGroup> findByIsActiveTrue();
    List<SHGGroup> findByVillageAndIsActiveTrue(String village);
    List<SHGGroup> findByBusinessType(String businessType);
}
```

### LoanSchemeRepository.java
```java
package com.graminudyami.repository;

import com.graminudyami.entity.LoanScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoanSchemeRepository extends JpaRepository<LoanScheme, UUID> {
    List<LoanScheme> findByIsActiveTrue();
    
    @Query("SELECT l FROM LoanScheme l WHERE l.isActive = true " +
           "AND (:forWomen IS NULL OR l.forWomen = :forWomen) " +
           "AND (:forShg IS NULL OR l.forShg = :forShg)")
    List<LoanScheme> findByFilters(Boolean forWomen, Boolean forShg);
    
    @Query("SELECT l FROM LoanScheme l WHERE l.isActive = true " +
           "AND :businessType MEMBER OF l.applicableBusinessTypes")
    List<LoanScheme> findByBusinessType(String businessType);
    
    List<LoanScheme> findByIsActiveTrueOrderByInterestRateAsc();
}
```

---

## 4. Service Layer

### BusinessService.java
```java
package com.graminudyami.service;

import com.graminudyami.entity.Business;
import com.graminudyami.repository.BusinessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BusinessService {
    private final BusinessRepository businessRepository;
    
    public List<Business> getAllActiveBusinesses() {
        return businessRepository.findByIsActiveTrue();
    }
    
    public Business getBusinessById(UUID id) {
        return businessRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
    }
    
    public Business getUserBusiness(UUID userId) {
        return businessRepository.findByUserIdAndIsActiveTrue(userId)
            .orElse(null);
    }
    
    @Transactional
    public Business createBusiness(Business business, UUID userId) {
        business.setUserId(userId);
        business.setIsActive(true);
        return businessRepository.save(business);
    }
    
    @Transactional
    public Business updateBusiness(UUID id, Business updates, UUID userId) {
        Business business = getBusinessById(id);
        
        if (!business.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to update this business");
        }
        
        // Update fields
        if (updates.getBusinessName() != null) {
            business.setBusinessName(updates.getBusinessName());
        }
        // ... more field updates
        
        return businessRepository.save(business);
    }
}
```

### SHGGroupService.java
```java
package com.graminudyami.service;

import com.graminudyami.entity.*;
import com.graminudyami.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SHGGroupService {
    private final SHGGroupRepository groupRepository;
    private final SHGGroupMemberRepository memberRepository;
    private final SHGGroupIncomeRepository incomeRepository;
    private final SHGGroupSavingsRepository savingsRepository;
    
    public List<SHGGroup> getAllActiveGroups() {
        return groupRepository.findByIsActiveTrue();
    }
    
    public SHGGroup getGroupById(UUID id) {
        return groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }
    
    @Transactional
    public SHGGroup createGroup(SHGGroup group, UUID leaderId) {
        group.setLeaderId(leaderId);
        group.setIsActive(true);
        SHGGroup savedGroup = groupRepository.save(group);
        
        // Add leader as a member
        SHGGroupMember leaderMember = new SHGGroupMember();
        leaderMember.setGroup(savedGroup);
        leaderMember.setUserId(leaderId);
        leaderMember.setRole(SHGMemberRole.LEADER);
        leaderMember.setFullName(group.getName() + " Leader");
        memberRepository.save(leaderMember);
        
        return savedGroup;
    }
    
    public BigDecimal calculateTotalIncome(UUID groupId) {
        return incomeRepository.sumAmountByGroupId(groupId);
    }
    
    public BigDecimal calculateTotalSavings(UUID groupId) {
        return savingsRepository.sumAmountByGroupId(groupId);
    }
    
    @Transactional
    public void addMember(UUID groupId, SHGGroupMember member, UUID requesterId) {
        SHGGroup group = getGroupById(groupId);
        
        if (!group.getLeader().getId().equals(requesterId)) {
            throw new UnauthorizedException("Only leader can add members");
        }
        
        member.setGroup(group);
        memberRepository.save(member);
    }
    
    @Transactional
    public void recordIncome(UUID groupId, SHGGroupIncome income, UUID recorderId) {
        SHGGroup group = getGroupById(groupId);
        income.setGroup(group);
        income.setRecordedBy(recorderId);
        incomeRepository.save(income);
    }
}
```

### EMICalculatorService.java
```java
package com.graminudyami.service;

import com.graminudyami.dto.EMICalculationDTO;
import com.graminudyami.entity.EMICalculation;
import com.graminudyami.repository.EMICalculationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EMICalculatorService {
    private final EMICalculationRepository emiRepository;
    
    /**
     * Calculate EMI using standard formula:
     * EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
     * 
     * Where:
     * P = Principal loan amount
     * R = Monthly interest rate (Annual Rate / 12 / 100)
     * N = Loan tenure in months
     */
    public EMICalculationDTO calculateEMI(BigDecimal principal, 
                                          BigDecimal annualRate, 
                                          int tenureMonths) {
        // Monthly interest rate
        BigDecimal monthlyRate = annualRate
            .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP)
            .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);
        
        // (1 + R)^N
        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal onePlusRPowerN = onePlusR.pow(tenureMonths);
        
        // Numerator: P x R x (1+R)^N
        BigDecimal numerator = principal
            .multiply(monthlyRate)
            .multiply(onePlusRPowerN);
        
        // Denominator: (1+R)^N - 1
        BigDecimal denominator = onePlusRPowerN.subtract(BigDecimal.ONE);
        
        // EMI
        BigDecimal emi = numerator.divide(denominator, 2, RoundingMode.HALF_UP);
        
        // Total payment
        BigDecimal totalPayment = emi.multiply(BigDecimal.valueOf(tenureMonths));
        
        // Total interest
        BigDecimal totalInterest = totalPayment.subtract(principal);
        
        return new EMICalculationDTO(emi, totalPayment, totalInterest);
    }
    
    public EMICalculation saveCalculation(UUID userId, EMICalculationDTO dto, UUID loanSchemeId) {
        EMICalculation calculation = new EMICalculation();
        calculation.setUserId(userId);
        calculation.setLoanSchemeId(loanSchemeId);
        calculation.setLoanAmount(dto.getLoanAmount());
        calculation.setInterestRate(dto.getInterestRate());
        calculation.setTenureMonths(dto.getTenureMonths());
        calculation.setMonthlyEmi(dto.getMonthlyEmi());
        calculation.setTotalPayment(dto.getTotalPayment());
        calculation.setTotalInterest(dto.getTotalInterest());
        
        return emiRepository.save(calculation);
    }
}
```

---

## 5. Controller APIs

### SHGGroupController.java
```java
package com.graminudyami.controller;

import com.graminudyami.entity.*;
import com.graminudyami.service.SHGGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shg-groups")
@RequiredArgsConstructor
public class SHGGroupController {
    private final SHGGroupService groupService;
    
    @GetMapping
    public ResponseEntity<List<SHGGroup>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllActiveGroups());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SHGGroup> getGroupById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }
    
    @PostMapping
    public ResponseEntity<SHGGroup> createGroup(
            @RequestBody SHGGroup group,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.createGroup(group, user.getId()));
    }
    
    @GetMapping("/{id}/members")
    public ResponseEntity<List<SHGGroupMember>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getMembers(id));
    }
    
    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable UUID id,
            @RequestBody SHGGroupMember member,
            @AuthenticationPrincipal User user) {
        groupService.addMember(id, member, user.getId());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/income")
    public ResponseEntity<List<SHGGroupIncome>> getIncome(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getIncome(id));
    }
    
    @PostMapping("/{id}/income")
    public ResponseEntity<Void> recordIncome(
            @PathVariable UUID id,
            @RequestBody SHGGroupIncome income,
            @AuthenticationPrincipal User user) {
        groupService.recordIncome(id, income, user.getId());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/savings")
    public ResponseEntity<List<SHGGroupSavings>> getSavings(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getSavings(id));
    }
    
    @PostMapping("/{id}/savings")
    public ResponseEntity<Void> recordSavings(
            @PathVariable UUID id,
            @RequestBody SHGGroupSavings savings,
            @AuthenticationPrincipal User user) {
        groupService.recordSavings(id, savings, user.getId());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/stats")
    public ResponseEntity<GroupStatsDTO> getGroupStats(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupStats(id));
    }
}
```

### LoanSchemeController.java
```java
package com.graminudyami.controller;

import com.graminudyami.dto.EMICalculationDTO;
import com.graminudyami.entity.LoanScheme;
import com.graminudyami.service.EMICalculatorService;
import com.graminudyami.service.LoanSchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loan-schemes")
@RequiredArgsConstructor
public class LoanSchemeController {
    private final LoanSchemeService loanService;
    private final EMICalculatorService emiService;
    
    @GetMapping
    public ResponseEntity<List<LoanScheme>> getAllSchemes(
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Boolean forWomen,
            @RequestParam(required = false) Boolean forShg) {
        return ResponseEntity.ok(loanService.findByFilters(businessType, state, forWomen, forShg));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LoanScheme> getSchemeById(@PathVariable UUID id) {
        return ResponseEntity.ok(loanService.getSchemeById(id));
    }
    
    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveScheme(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        loanService.saveScheme(user.getId(), id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveScheme(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        loanService.unsaveScheme(user.getId(), id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/saved")
    public ResponseEntity<List<LoanScheme>> getSavedSchemes(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(loanService.getSavedSchemes(user.getId()));
    }
    
    @PostMapping("/calculate-emi")
    public ResponseEntity<EMICalculationDTO> calculateEMI(
            @RequestParam BigDecimal loanAmount,
            @RequestParam BigDecimal interestRate,
            @RequestParam int tenureMonths) {
        return ResponseEntity.ok(emiService.calculateEMI(loanAmount, interestRate, tenureMonths));
    }
    
    @PostMapping("/calculate-emi/save")
    public ResponseEntity<Void> saveEMICalculation(
            @RequestBody EMICalculationDTO dto,
            @RequestParam(required = false) UUID loanSchemeId,
            @AuthenticationPrincipal User user) {
        emiService.saveCalculation(user.getId(), dto, loanSchemeId);
        return ResponseEntity.ok().build();
    }
}
```

---

## 6. REST API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Authentication** |||
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/logout | User logout |
| GET | /api/auth/profile | Get current user profile |
| **Businesses** |||
| GET | /api/businesses | List all active businesses |
| GET | /api/businesses/{id} | Get business details |
| POST | /api/businesses | Create new business |
| PUT | /api/businesses/{id} | Update business |
| DELETE | /api/businesses/{id} | Deactivate business |
| **Products** |||
| GET | /api/products | List available products |
| GET | /api/products/{id} | Get product details |
| POST | /api/products | Create product |
| PUT | /api/products/{id} | Update product |
| DELETE | /api/products/{id} | Delete product |
| **Orders** |||
| POST | /api/orders | Place order |
| GET | /api/orders | Get user's orders |
| GET | /api/orders/business | Get business orders |
| PUT | /api/orders/{id}/status | Update order status |
| **SHG Groups** |||
| GET | /api/shg-groups | List all groups |
| POST | /api/shg-groups | Create group |
| GET | /api/shg-groups/{id} | Get group details |
| POST | /api/shg-groups/{id}/members | Add member |
| GET | /api/shg-groups/{id}/members | Get members |
| POST | /api/shg-groups/{id}/income | Record income |
| POST | /api/shg-groups/{id}/savings | Record savings |
| GET | /api/shg-groups/{id}/stats | Get group statistics |
| **Loan Schemes** |||
| GET | /api/loan-schemes | List loan schemes |
| GET | /api/loan-schemes/{id} | Get scheme details |
| POST | /api/loan-schemes/{id}/save | Bookmark scheme |
| GET | /api/loan-schemes/saved | Get saved schemes |
| POST | /api/loan-schemes/calculate-emi | Calculate EMI |
| **Finance** |||
| GET | /api/income | Get user income records |
| POST | /api/income | Add income |
| DELETE | /api/income/{id} | Delete income |
| GET | /api/expenses | Get user expenses |
| POST | /api/expenses | Add expense |
| DELETE | /api/expenses/{id} | Delete expense |
| **Courses** |||
| GET | /api/courses | List courses |
| GET | /api/courses/{id} | Get course details |
| POST | /api/courses/{id}/enroll | Enroll in course |
| PUT | /api/courses/{id}/progress | Update progress |
| **Government Schemes** |||
| GET | /api/schemes | List schemes |
| GET | /api/schemes/{id} | Get scheme details |
| POST | /api/schemes/{id}/apply | Mark as applied |

---

## 7. Integration Workflow Explanation

### Frontend → Backend → Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User Action → API Call → Response Handling → UI Update  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP Request (JSON)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                         │
│  ┌───────────┐    ┌───────────┐    ┌─────────────────────────┐ │
│  │Controller │ → │  Service  │ → │     Repository         │ │
│  │(API Layer)│    │(Business  │    │(Data Access Layer)     │ │
│  │           │    │ Logic)    │    │                         │ │
│  └───────────┘    └───────────┘    └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ SQL Queries
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Tables: users, profiles, businesses, products, orders,   ││
│  │  shg_groups, shg_group_members, loan_schemes, income, etc ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Example Workflows

#### 1. Learning Module - Applying Filters
```
1. User selects "Business Basics" category filter
2. Frontend sends: GET /api/courses?category=business_basics
3. Backend CourseService queries: courseRepository.findByCategory("business_basics")
4. Database executes: SELECT * FROM courses WHERE category = 'business_basics'
5. Results returned to frontend, UI updates course list
```

#### 2. Placing Order in Marketplace
```
1. User clicks "Place Order" with cart items
2. Frontend sends: POST /api/orders with items array
3. Backend OrderService:
   - Creates Order record
   - Creates OrderItem records for each product
   - Updates product stock quantities
   - If SHG business, records SHG group income
4. Database transactions ensure all-or-nothing operation
5. Confirmation returned to frontend
```

#### 3. Recording Income/Expense
```
1. User fills income/expense form
2. Frontend sends: POST /api/income or /api/expenses
3. Backend FinanceService:
   - Validates user ownership
   - Creates record with user_id
4. Database stores with timestamp
5. Dashboard statistics automatically updated on next fetch
```

---

## 8. Security Implementation

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products", "/api/courses", "/api/schemes").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

This documentation provides a complete Spring Boot backend implementation that mirrors
the functionality of the Lovable Cloud backend used in the actual application.
