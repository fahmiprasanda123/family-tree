package config

import (
	"os"
)

type Config struct {
	DatabaseURL      string
	JWTSecret        string
	CloudinaryURL    string
	CloudinaryCloud  string
	CloudinaryKey    string
	CloudinarySecret string
	Port             string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return &Config{
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		JWTSecret:        os.Getenv("JWT_SECRET"),
		CloudinaryURL:    os.Getenv("CLOUDINARY_URL"),
		CloudinaryCloud:  os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryKey:    os.Getenv("CLOUDINARY_API_KEY"),
		CloudinarySecret: os.Getenv("CLOUDINARY_API_SECRET"),
		Port:             port,
	}
}
