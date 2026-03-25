package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Relationship struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	ParentID         uuid.UUID  `gorm:"type:uuid;not null" json:"parent_id"`
	ChildID          uuid.UUID  `gorm:"type:uuid;not null" json:"child_id"`
	RelationshipType string     `gorm:"default:'biological'" json:"relationship_type"` // biological, adopted
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`

	Parent *FamilyMember `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Child  *FamilyMember `gorm:"foreignKey:ChildID" json:"child,omitempty"`
}

func (r *Relationship) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

func (r *Relationship) BeforeSave(tx *gorm.DB) error {
	// Prevent self-relation
	if r.ParentID == r.ChildID {
		return gorm.ErrInvalidData
	}
	return nil
}

func init() {
	_ = gorm.DeletedAt{}
}
