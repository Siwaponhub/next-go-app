package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
)

type Employee struct {
	ID           int     `json:"id"`
	FirstName    string  `json:"first_name"`
	LastName     string  `json:"last_name"`
	Email        string  `json:"email"`
	Phone        string  `json:"phone"`
	DepartmentID int     `json:"department_id"`
	PositionID   int     `json:"position_id"`
	Salary       float64 `json:"salary"`
	Status       string  `json:"status"`
}

// CRUD Handler
func employeeHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		switch r.Method {

		// GET
		case "GET":
			rows, err := db.Query(`
				SELECT id, first_name, last_name, email, phone,
				department_id, position_id, salary, status
				FROM employee
			`)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			defer rows.Close()

			employees := []Employee{}

			for rows.Next() {
				var emp Employee
				err := rows.Scan(
					&emp.ID, &emp.FirstName, &emp.LastName,
					&emp.Email, &emp.Phone, &emp.DepartmentID,
					&emp.PositionID, &emp.Salary, &emp.Status,
				)
				if err != nil {
					http.Error(w, err.Error(), 500)
					return
				}
				employees = append(employees, emp)
			}

			json.NewEncoder(w).Encode(employees)

		// POST / PUT
		case "POST", "PUT":
			var emp Employee

			if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
				http.Error(w, err.Error(), 400)
				return
			}

			var result sql.Result
			var err error

			if r.Method == "POST" {
				result, err = db.Exec(`
					INSERT INTO employee
					(first_name, last_name, email, phone, department_id,
					position_id, salary, status)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				`,
					emp.FirstName, emp.LastName, emp.Email, emp.Phone,
					emp.DepartmentID, emp.PositionID, emp.Salary, emp.Status,
				)

				if err == nil {
					id, _ := result.LastInsertId()
					emp.ID = int(id)
				}

			} else {
				id, _ := strconv.Atoi(r.URL.Query().Get("id"))
				emp.ID = id

				_, err = db.Exec(`
					UPDATE employee SET
					first_name=?, last_name=?, email=?, phone=?,
					department_id=?, position_id=?, salary=?, status=?
					WHERE id=?
				`,
					emp.FirstName, emp.LastName, emp.Email, emp.Phone,
					emp.DepartmentID, emp.PositionID, emp.Salary,
					emp.Status, id,
				)
			}

			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}

			json.NewEncoder(w).Encode(emp)

		// DELETE
		case "DELETE":
			id, err := strconv.Atoi(r.URL.Query().Get("id"))
			if err != nil {
				http.Error(w, "Invalid ID", 400)
				return
			}

			_, err = db.Exec("DELETE FROM employee WHERE id=?", id)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}

			json.NewEncoder(w).Encode(map[string]string{
				"message": "Employee deleted successfully",
			})

		default:
			http.Error(w, "Method not allowed", 405)
		}
	}
}

// CORS
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	db, err := sql.Open("mysql", os.Getenv("DB_DSN"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/api/employees", employeeHandler(db))

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}

