package handlers

import (
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
)

type UploadHandler struct {
	CloudName string
	APIKey    string
	APISecret string
}

func NewUploadHandler(cloudName, apiKey, apiSecret string) *UploadHandler {
	return &UploadHandler{
		CloudName: cloudName,
		APIKey:    apiKey,
		APISecret: apiSecret,
	}
}

func (h *UploadHandler) UploadPhoto(c *fiber.Ctx) error {
	file, err := c.FormFile("photo")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No photo file provided"})
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}
	if !allowedExts[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only image files are allowed (jpg, jpeg, png, webp, gif)"})
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File size must be less than 5MB"})
	}

	// Read file content
	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read file"})
	}
	defer src.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(src)

	// Check if Cloudinary is configured
	if h.CloudName == "" || h.APIKey == "" || h.APISecret == "" {
		// Fallback: save locally for development
		return h.uploadLocally(c, file, buf.Bytes())
	}

	// Upload to Cloudinary
	cld, err := cloudinary.NewFromParams(h.CloudName, h.APIKey, h.APISecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to initialize Cloudinary"})
	}

	uploadResult, err := cld.Upload.Upload(context.Background(), bytes.NewReader(buf.Bytes()), uploader.UploadParams{
		Folder:         "silsilah-keluarga",
		Transformation: "w_800,h_800,c_limit,q_auto,f_auto",
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to upload photo: %v", err)})
	}

	return c.JSON(fiber.Map{
		"message":   "Photo uploaded successfully",
		"url":       uploadResult.SecureURL,
		"public_id": uploadResult.PublicID,
	})
}

func (h *UploadHandler) uploadLocally(c *fiber.Ctx, file *multipart.FileHeader, _ []byte) error {
	uploadDir := "./uploads"
	os.MkdirAll(uploadDir, 0755)

	// Replace spaces with underscores to avoid URL encoding issues
	safeFilename := strings.ReplaceAll(file.Filename, " ", "_")
	
	// Ensure unique filename to prevent overwriting
	timestamp := time.Now().UnixNano()
	filename := fmt.Sprintf("%d_%s", timestamp, safeFilename)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Use c.BaseURL() which gives "http://localhost:8080"
	url := fmt.Sprintf("%s/uploads/%s", c.BaseURL(), filename)
	return c.JSON(fiber.Map{
		"message": "Photo uploaded successfully (local)",
		"url":     url,
	})
}
