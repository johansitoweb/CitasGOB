package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Cita struct {
	ID                int       `json:"id"`
	Tramite           string    `json:"tramite"`
	Institucion       string    `json:"institucion"`
	Nombres           string    `json:"nombres"`
	Apellidos         string    `json:"apellidos"`
	Telefono          string    `json:"telefono"`
	CorreoElectronico string    `json:"correo_electronico"`
	Cedula            string    `json:"cedula"`
	Direccion         string    `json:"direccion"`
	FechaCita         time.Time `json:"fecha_cita"`
}

const (
	dbFileName = "citas.db"
)

var db *sql.DB

func initDB() error {
	var err error
	db, err = sql.Open("sqlite3", dbFileName)
	if err != nil {
		return fmt.Errorf("error al abrir la base de datos: %w", err)
	}

	if err = db.Ping(); err != nil {
		return fmt.Errorf("error al hacer ping a la base de datos: %w", err)
	}

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS citas (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		tramite TEXT NOT NULL,
		institucion TEXT NOT NULL,
		nombres TEXT NOT NULL,
		apellidos TEXT NOT NULL,
		telefono TEXT NOT NULL,
		correo_electronico TEXT NOT NULL,
		cedula TEXT NOT NULL,
		direccion TEXT NOT NULL, -- Agregado para coincidir con la UI
		fecha_cita TEXT NOT NULL -- Guardamos la fecha como TEXT en formato ISO8601
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		db.Close()
		return fmt.Errorf("error al crear la tabla citas: %w", err)
	}

	log.Println("Base de datos y tabla 'citas' inicializadas correctamente.")
	return nil
}

func addCita(cita Cita) (int64, error) {
	insertSQL := `
	INSERT INTO citas (
		tramite, institucion, nombres, apellidos, telefono,
		correo_electronico, cedula, direccion, fecha_cita
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`

	result, err := db.Exec(
		insertSQL,
		cita.Tramite,
		cita.Institucion,
		cita.Nombres,
		cita.Apellidos,
		cita.Telefono,
		cita.CorreoElectronico,
		cita.Cedula,
		cita.Direccion,
		cita.FechaCita.Format(time.RFC3339),
	)
	if err != nil {
		return 0, fmt.Errorf("error al insertar cita: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error al obtener el ID de la última inserción: %w", err)
	}

	return id, nil
}

func handleAddCita(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var newCita Cita
	err := json.NewDecoder(r.Body).Decode(&newCita)
	if err != nil {
		http.Error(w, "Error al decodificar JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if newCita.Nombres == "" || newCita.Apellidos == "" || newCita.FechaCita.IsZero() {
		http.Error(w, "Faltan campos obligatorios (Nombres, Apellidos, Fecha de Cita)", http.StatusBadRequest)
		return
	}

	id, err := addCita(newCita)
	if err != nil {
		log.Printf("Error al añadir cita a la DB: %v", err)
		http.Error(w, "Error interno del servidor al guardar la cita", http.StatusInternalServerError)
		return
	}

	newCita.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Cita agendada con éxito",
		"id":      id,
		"cita":    newCita,
	})
	log.Printf("Cita agendada con éxito, ID: %d", id)
}

func main() {

	if err := initDB(); err != nil {
		log.Fatalf("No se pudo inicializar la base de datos: %v", err)
	}
	defer db.Close()

	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)

	http.HandleFunc("/api/cita", handleAddCita)

	log.Println("Servidor iniciado en http://localhost:8080")
	log.Println("Sirviendo archivos estáticos desde ./public")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
