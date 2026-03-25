package routes

import (
	"silsilah-keluarga/handlers"
	"silsilah-keluarga/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App, jwtSecret string, uploadHandler *handlers.UploadHandler) {
	authHandler := handlers.NewAuthHandler(jwtSecret)
	memberHandler := handlers.NewMemberHandler()
	relHandler := handlers.NewRelationshipHandler()

	api := app.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Get("/me", middleware.AuthRequired(jwtSecret), authHandler.Me)

	// Tree (public)
	api.Get("/tree", relHandler.GetTree)

	// Members
	members := api.Group("/members")
	members.Get("/", memberHandler.List)
	members.Get("/:id", memberHandler.Get)
	members.Post("/", middleware.AuthRequired(jwtSecret), memberHandler.Create)
	members.Put("/:id", middleware.AuthRequired(jwtSecret), memberHandler.Update)
	members.Delete("/:id", middleware.AuthRequired(jwtSecret), middleware.AdminRequired(), memberHandler.Delete)
	members.Post("/:id/link-user", middleware.AuthRequired(jwtSecret), middleware.AdminRequired(), memberHandler.LinkUserToMember)

	// Relationships (any logged in user can create, admin only for delete)
	rels := api.Group("/relationships", middleware.AuthRequired(jwtSecret))
	rels.Post("/", relHandler.Create)
	rels.Delete("/:id", middleware.AdminRequired(), relHandler.Delete)

	// Upload
	api.Post("/upload/photo", middleware.AuthRequired(jwtSecret), uploadHandler.UploadPhoto)

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "silsilah-keluarga-api"})
	})
}
