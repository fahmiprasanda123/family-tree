package database

import (
	"log"
	"os"
	"silsilah-keluarga/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(dsn string) {
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// Auto-migrate models
	err = DB.AutoMigrate(
		&models.User{},
		&models.FamilyMember{},
		&models.Relationship{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migrated successfully")

	// Seed default admin user
	seedDefaultAdmin()
}

func seedDefaultAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("email = ?", "admin@admin.com").Count(&count)
	if count == 0 {
		password := os.Getenv("DEFAULT_ADMIN_PASSWORD")
		if password == "" {
			password = "admin123"
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash default admin password: %v", err)
			return
		}

		adminUser := models.User{
			Name:     "Administrator",
			Email:    "admin@admin.com",
			Password: string(hashedPassword),
			Role:     "admin",
		}
		if err := DB.Create(&adminUser).Error; err != nil {
			log.Printf("Failed to seed default admin: %v", err)
		} else {
			log.Printf("Default admin user created: admin@admin.com (Password: %s)", password)
		}
	}
}

