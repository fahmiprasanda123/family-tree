package handlers

import (
	"silsilah-keluarga/database"
	"silsilah-keluarga/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type RelationshipHandler struct{}

func NewRelationshipHandler() *RelationshipHandler {
	return &RelationshipHandler{}
}

// GetTree returns all members and relationships formatted for React Flow
func (h *RelationshipHandler) GetTree(c *fiber.Ctx) error {
	var members []models.FamilyMember
	database.DB.Order("full_name asc").Find(&members)

	var relationships []models.Relationship
	database.DB.Find(&relationships)

	// Build nodes (React Flow format)
	nodes := make([]fiber.Map, 0, len(members))
	for _, m := range members {
		nodes = append(nodes, fiber.Map{
			"id":   m.ID.String(),
			"type": "member",
			"data": fiber.Map{
				"id":         m.ID,
				"full_name":  m.FullName,
				"nickname":   m.Nickname,
				"gender":     m.Gender,
				"photo_url":  m.PhotoURL,
				"birth_date": m.BirthDate,
				"is_alive":   m.IsAlive,
				"occupation": m.Occupation,
			},
			"position": fiber.Map{"x": 0, "y": 0}, // Frontend handles layout
		})
	}

	// Build edges
	edges := make([]fiber.Map, 0, len(relationships))
	for _, r := range relationships {
		edges = append(edges, fiber.Map{
			"id":     r.ID.String(),
			"source": r.ParentID.String(),
			"target": r.ChildID.String(),
			"type":   "smoothstep",
			"label":  r.RelationshipType,
		})
	}

	return c.JSON(fiber.Map{
		"nodes": nodes,
		"edges": edges,
	})
}

type CreateRelationshipRequest struct {
	ParentID         string `json:"parent_id"`
	ChildID          string `json:"child_id"`
	RelationshipType string `json:"relationship_type"`
}

func (h *RelationshipHandler) Create(c *fiber.Ctx) error {
	var req CreateRelationshipRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	parentID, err := uuid.Parse(req.ParentID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid parent_id"})
	}
	childID, err := uuid.Parse(req.ChildID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid child_id"})
	}

	if parentID == childID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Parent and child cannot be the same person"})
	}

	// Check if both members exist
	var parentMember, childMember models.FamilyMember
	if database.DB.First(&parentMember, "id = ?", parentID).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Parent member not found"})
	}
	if database.DB.First(&childMember, "id = ?", childID).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Child member not found"})
	}

	// Check if relationship already exists
	var existing models.Relationship
	if database.DB.Where("parent_id = ? AND child_id = ?", parentID, childID).First(&existing).Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Relationship already exists"})
	}

	relType := req.RelationshipType
	if relType == "" {
		relType = "biological"
	}

	rel := models.Relationship{
		ParentID:         parentID,
		ChildID:          childID,
		RelationshipType: relType,
	}

	if result := database.DB.Create(&rel); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create relationship"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Relationship created successfully",
		"data":    rel,
	})
}

func (h *RelationshipHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	var rel models.Relationship
	if database.DB.First(&rel, "id = ?", id).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Relationship not found"})
	}
	database.DB.Delete(&rel)
	return c.JSON(fiber.Map{"message": "Relationship deleted successfully"})
}
