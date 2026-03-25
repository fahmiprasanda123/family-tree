package handlers

import (
	"silsilah-keluarga/database"
	"silsilah-keluarga/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type MemberHandler struct{}

func NewMemberHandler() *MemberHandler {
	return &MemberHandler{}
}

type CreateMemberRequest struct {
	FullName   string  `json:"full_name"`
	Nickname   string  `json:"nickname"`
	Gender     string  `json:"gender"`
	BirthDate  *string `json:"birth_date"`
	BirthPlace string  `json:"birth_place"`
	DeathDate  *string `json:"death_date"`
	PhotoURL   string  `json:"photo_url"`
	Bio        string  `json:"bio"`
	Phone      string  `json:"phone"`
	Address    string  `json:"address"`
	Occupation string  `json:"occupation"`
	IsAlive    bool    `json:"is_alive"`
}

func (h *MemberHandler) List(c *fiber.Ctx) error {
	var members []models.FamilyMember
	if result := database.DB.Order("full_name asc").Find(&members); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch members"})
	}
	return c.JSON(fiber.Map{"data": members, "count": len(members)})
}

func (h *MemberHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	var member models.FamilyMember
	if result := database.DB.First(&member, "id = ?", id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	// Load relationships where this person is the "target/child"
	var allAsChild []models.Relationship
	database.DB.Preload("Parent").Where("child_id = ?", id).Find(&allAsChild)

	// Load relationships where this person is the "source/parent"
	var allAsParent []models.Relationship
	database.DB.Preload("Child").Where("parent_id = ?", id).Find(&allAsParent)

	var parents []models.Relationship
	var children []models.Relationship
	var spouses []models.FamilyMember

	for _, rel := range allAsChild {
		if rel.RelationshipType == "spouse" {
			if rel.Parent != nil {
				spouses = append(spouses, *rel.Parent)
			}
		} else {
			parents = append(parents, rel)
		}
	}

	for _, rel := range allAsParent {
		if rel.RelationshipType == "spouse" {
			if rel.Child != nil {
				spouses = append(spouses, *rel.Child)
			}
		} else {
			children = append(children, rel)
		}
	}

	return c.JSON(fiber.Map{
		"data":     member,
		"parents":  parents,
		"children": children,
		"spouses":  spouses,
	})
}

func (h *MemberHandler) Create(c *fiber.Ctx) error {
	var req CreateMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.FullName == "" || req.Gender == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Full name and gender are required"})
	}

	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	member := models.FamilyMember{
		FullName:   req.FullName,
		Nickname:   req.Nickname,
		Gender:     req.Gender,
		BirthPlace: req.BirthPlace,
		PhotoURL:   req.PhotoURL,
		Bio:        req.Bio,
		Phone:      req.Phone,
		Address:    req.Address,
		Occupation: req.Occupation,
		IsAlive:    req.IsAlive,
		CreatedBy:  userID,
	}

	if req.BirthDate != nil && *req.BirthDate != "" {
		t, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			member.BirthDate = &t
		}
	}

	if req.DeathDate != nil && *req.DeathDate != "" {
		t, err := time.Parse("2006-01-02", *req.DeathDate)
		if err == nil {
			member.DeathDate = &t
		}
	}

	if result := database.DB.Create(&member); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create member"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Member created successfully",
		"data":    member,
	})
}

func (h *MemberHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	userIDStr := c.Locals("userID").(string)
	userRole := c.Locals("userRole").(string)

	var member models.FamilyMember
	if result := database.DB.First(&member, "id = ?", id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	// Only admin or the creator can update
	if userRole != "admin" && member.CreatedBy.String() != userIDStr {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You don't have permission to update this member"})
	}

	var req CreateMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	updates := map[string]interface{}{
		"full_name":  req.FullName,
		"nickname":   req.Nickname,
		"gender":     req.Gender,
		"birth_place": req.BirthPlace,
		"photo_url":  req.PhotoURL,
		"bio":        req.Bio,
		"phone":      req.Phone,
		"address":    req.Address,
		"occupation": req.Occupation,
		"is_alive":   req.IsAlive,
	}

	if req.BirthDate != nil && *req.BirthDate != "" {
		t, err := time.Parse("2006-01-02", *req.BirthDate)
		if err == nil {
			updates["birth_date"] = t
		}
	}
	if req.DeathDate != nil && *req.DeathDate != "" {
		t, err := time.Parse("2006-01-02", *req.DeathDate)
		if err == nil {
			updates["death_date"] = t
		}
	}

	database.DB.Model(&member).Updates(updates)
	return c.JSON(fiber.Map{"message": "Member updated successfully", "data": member})
}

func (h *MemberHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	var member models.FamilyMember
	if result := database.DB.First(&member, "id = ?", id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}
	database.DB.Delete(&member)
	return c.JSON(fiber.Map{"message": "Member deleted successfully"})
}

// LinkUserToMember - admin can link a user account to a family member profile
func (h *MemberHandler) LinkUserToMember(c *fiber.Ctx) error {
	memberID := c.Params("id")
	body := struct {
		UserID string `json:"user_id"`
	}{}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	uid, err := uuid.Parse(body.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user_id"})
	}
	mid, err := uuid.Parse(memberID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid member id"})
	}

	if result := database.DB.Model(&models.User{}).Where("id = ?", uid).Update("family_member_id", mid); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to link user"})
	}

	return c.JSON(fiber.Map{"message": "User linked to member successfully"})
}
