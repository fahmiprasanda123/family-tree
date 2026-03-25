package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FamilyMember struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	FullName   string         `gorm:"not null" json:"full_name"`
	Nickname   string         `json:"nickname"`
	Gender     string         `gorm:"not null" json:"gender"` // male, female
	BirthDate  *time.Time     `json:"birth_date,omitempty"`
	BirthPlace string         `json:"birth_place"`
	DeathDate  *time.Time     `json:"death_date,omitempty"`
	PhotoURL   string         `json:"photo_url"`
	Bio        string         `gorm:"type:text" json:"bio"`
	Phone      string         `json:"phone"`
	Address    string         `gorm:"type:text" json:"address"`
	Occupation string         `json:"occupation"`
	IsAlive    bool           `gorm:"default:true" json:"is_alive"`
	CreatedBy  uuid.UUID      `gorm:"type:uuid" json:"created_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships loaded separately
	Parents  []Relationship `gorm:"foreignKey:ChildID" json:"parents,omitempty"`
	Children []Relationship `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (f *FamilyMember) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}
