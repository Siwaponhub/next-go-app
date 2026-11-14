// // package main

// // import (
// // 	"database/sql"
// // 	"fmt"
// // 	"log"
// // 	"time"

// // 	_ "github.com/go-sql-driver/mysql"
// // )

// // type User struct {
// // 	ID    int
// // 	Name  string
// // 	Email string
// // }

// // func main() {
// // 	// รูปแบบ: user:password@tcp(127.0.0.1:3306)/ชื่อฐานข้อมูล
// // 	dsn := "root:siwapon!2835@tcp(127.0.0.1:3306)/warehouse?parseTime=true"

// // 	db, err := sql.Open("mysql", dsn)
// // 	if err != nil {
// // 		log.Fatal(err)
// // 	}
// // 	defer db.Close()

// // 	// 1. ทดสอบเชื่อมต่อ
// // 	if err := db.Ping(); err != nil {
// // 		log.Fatalf("❌ เชื่อมต่อ MariaDB ไม่สำเร็จ: %v", err)
// // 	}
// // 	fmt.Println("🎉 เชื่อมต่อ MariaDB สำเร็จแล้ว!")

// // 	// 2. ลองเพิ่มข้อมูล (Create)
// // 	_, err = db.Exec("INSERT INTO employee (first_name, last_name, email, phone, department_id, position_id, salary,status,created_at) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)", "Somchai", "Somsri", "somchai@example.com", "0812345678", 1, 2, 50000, "active", time.Now())
// // 	if err != nil {
// // 		log.Fatal(err)
// // 	}
// // 	fmt.Println("✅ เพิ่มข้อมูลผู้ใช้สำเร็จ!")

// // 	// 3. ลองดึงข้อมูลมาแสดงผล (Read)
// // 	rows, err := db.Query("SELECT id, first_name, last_name, email FROM employee")
// // 	if err != nil {
// // 		log.Fatal(err)
// // 	}
// // 	defer rows.Close()

// //		for rows.Next() {
// //			var u User
// //			if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
// //				log.Fatal(err)
// //			}
// //			fmt.Printf("👤 ข้อมูลจาก DB -> ID: %d | ชื่อ: %s | อีเมล: %s\n", u.ID, u.Name, u.Email)
// //		}
// //	}
// package main

// import (
// 	"database/sql"
// 	"encoding/json"
// 	"errors"
// 	"log"
// 	"net/http"
// 	"strconv"
// 	"strings"
// 	"time"

// 	_ "github.com/go-sql-driver/mysql"
// )

// type Employee struct {
// 	ID             int       `json:"id"`
// 	FirstName      string    `json:"first_name"`
// 	LastName       string    `json:"last_name"`
// 	Email          string    `json:"email"`
// 	Phone          string    `json:"phone"`
// 	DepartmentID   int       `json:"department_id"`
// 	PositionID     int       `json:"position_id"`
// 	DepartmentName string    `json:"department_name,omitempty"`
// 	PositionName   string    `json:"position_name,omitempty"`
// 	Salary         float64   `json:"salary"`
// 	Status         string    `json:"status"`
// 	CreateAt       time.Time `json:"create_at"`
// }

// type OptionItem struct {
// 	ID   int    `json:"id"`
// 	Name string `json:"name"`
// }

// func main() {
// 	dsn := "root:siwapon!2835@tcp(127.0.0.1:3306)/warehouse?parseTime=true"
// 	db, err := sql.Open("mysql", dsn)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer db.Close()

// 	if err := db.Ping(); err != nil {
// 		log.Fatalf("เชื่อมต่อ MariaDB ไม่สำเร็จ: %v", err)
// 	}

// 	mux := http.NewServeMux()
// 	mux.Handle("/api/departments", withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		if r.Method != http.MethodGet {
// 			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
// 			return
// 		}

// 		rows, err := db.Query("SELECT id, name FROM department")
// 		if err != nil {
// 			writeJSONError(w, http.StatusInternalServerError, err.Error())
// 			return
// 		}
// 		defer rows.Close()

// 		var list []OptionItem
// 		for rows.Next() {
// 			var item OptionItem
// 			if err := rows.Scan(&item.ID, &item.Name); err != nil {
// 				writeJSONError(w, http.StatusInternalServerError, err.Error())
// 				return
// 			}
// 			list = append(list, item)
// 		}
// 		writeJSON(w, list)
// 	})))

// 	mux.Handle("/api/positions", withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		if r.Method != http.MethodGet {
// 			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
// 			return
// 		}

// 		rows, err := db.Query("SELECT id, name FROM `position`")
// 		if err != nil {
// 			writeJSONError(w, http.StatusInternalServerError, err.Error())
// 			return
// 		}
// 		defer rows.Close()

// 		var list []OptionItem
// 		for rows.Next() {
// 			var item OptionItem
// 			if err := rows.Scan(&item.ID, &item.Name); err != nil {
// 				writeJSONError(w, http.StatusInternalServerError, err.Error())
// 				return
// 			}
// 			list = append(list, item)
// 		}
// 		writeJSON(w, list)
// 	})))

// 	mux.Handle("/api/employees", withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		switch r.Method {
// 		case http.MethodGet:
// 			query := `
// 				SELECT e.id, e.first_name, e.last_name, e.email, e.phone,
// 				       e.department_id, e.position_id, d.name, p.name,
// 				       e.salary, e.status, e.created_at
// 				FROM employee e
// 				LEFT JOIN department d ON e.department_id = d.id
// 				LEFT JOIN ` + "`position`" + ` p ON e.position_id = p.id
// 				ORDER BY e.id DESC`

// 			rows, err := db.Query(query)
// 			if err != nil {
// 				writeJSONError(w, http.StatusInternalServerError, err.Error())
// 				return
// 			}
// 			defer rows.Close()

// 			var employees []Employee
// 			for rows.Next() {
// 				var emp Employee
// 				if err := rows.Scan(
// 					&emp.ID, &emp.FirstName, &emp.LastName, &emp.Email, &emp.Phone,
// 					&emp.DepartmentID, &emp.PositionID, &emp.DepartmentName, &emp.PositionName,
// 					&emp.Salary, &emp.Status, &emp.CreateAt,
// 				); err != nil {
// 					writeJSONError(w, http.StatusInternalServerError, err.Error())
// 					return
// 				}
// 				employees = append(employees, emp)
// 			}
// 			writeJSON(w, employees)
// 		case http.MethodPost:
// 			var emp Employee
// 			if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
// 				writeJSONError(w, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง")
// 				return
// 			}
// 			if emp.Status == "" {
// 				emp.Status = "active"
// 			}

// 			res, err := db.Exec(
// 				"INSERT INTO employee (first_name, last_name, email, phone, department_id, position_id, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
// 				emp.FirstName, emp.LastName, emp.Email, emp.Phone, emp.DepartmentID, emp.PositionID, emp.Salary, emp.Status,
// 			)
// 			if err != nil {
// 				writeJSONError(w, http.StatusInternalServerError, err.Error())
// 				return
// 			}
// 			id, _ := res.LastInsertId()
// 			emp.ID = int(id)
// 			writeJSONWithStatus(w, http.StatusCreated, emp)
// 		default:
// 			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
// 		}
// 	})))

// 	mux.Handle("/api/employees/", withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		id := strings.TrimPrefix(r.URL.Path, "/api/employees/")
// 		if id == "" || id == "/api/employees" {
// 			http.NotFound(w, r)
// 			return
// 		}

// 		if _, err := strconv.Atoi(id); err != nil {
// 			http.Error(w, "invalid employee id", http.StatusBadRequest)
// 			return
// 		}

// 		switch r.Method {
// 		case http.MethodPut:
// 			var emp Employee
// 			if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
// 				writeJSONError(w, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง")
// 				return
// 			}

// 			_, err := db.Exec(
// 				"UPDATE employee SET first_name=?, last_name=?, email=?, phone=?, department_id=?, position_id=?, salary=?, status=? WHERE id=?",
// 				emp.FirstName, emp.LastName, emp.Email, emp.Phone, emp.DepartmentID, emp.PositionID, emp.Salary, emp.Status, id,
// 			)
// 			if err != nil {
// 				writeJSONError(w, http.StatusInternalServerError, err.Error())
// 				return
// 			}
// 			writeJSON(w, map[string]string{"message": "อัปเดตข้อมูลสำเร็จ"})
// 		case http.MethodDelete:
// 			_, err := db.Exec("DELETE FROM employee WHERE id=?", id)
// 			if err != nil {
// 				writeJSONError(w, http.StatusInternalServerError, err.Error())
// 				return
// 			}
// 			writeJSON(w, map[string]string{"message": "ลบข้อมูลสำเร็จ"})
// 		default:
// 			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
// 		}
// 	})))

// 	log.Fatal(http.ListenAndServe(":8080", mux))
// }

// func withCORS(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
// 		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
// 		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
// 		if r.Method == http.MethodOptions {
// 			w.WriteHeader(http.StatusNoContent)
// 			return
// 		}
// 		next.ServeHTTP(w, r)
// 	})
// }

// func writeJSON(w http.ResponseWriter, payload interface{}) {
// 	writeJSONWithStatus(w, http.StatusOK, payload)
// }

// func writeJSONWithStatus(w http.ResponseWriter, status int, payload interface{}) {
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(status)
// 	if payload == nil {
// 		return
// 	}
// 	if err := json.NewEncoder(w).Encode(payload); err != nil {
// 		log.Printf("encode json: %v", err)
// 	}
// }

// func writeJSONError(w http.ResponseWriter, status int, message string) {
// 	writeJSONWithStatus(w, status, map[string]string{"error": message})
// }

// func ensureRowError(err error) error {
// 	if err == nil {
// 		return nil
// 	}
// 	return errors.New(err.Error())
// }

package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
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
	db, err := sql.Open("mysql", "root:siwapon!2835@tcp(127.0.0.1:3306)/warehouse")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/api/employees", func(w http.ResponseWriter, r *http.Request) {


		if r.Method == "GET" {
			rows, err := db.Query("SELECT id, first_name, last_name, email, phone, department_id, position_id, salary, status FROM employee")
			if err != nil {
				log.Fatal(err)
			}
			defer rows.Close()

			var employees []Employee

			for rows.Next() {
				var emp Employee

				rows.Scan(
					&emp.ID,
					&emp.FirstName,
					&emp.LastName,
					&emp.Email,
					&emp.Phone,
					&emp.DepartmentID,
					&emp.PositionID,
					&emp.Salary,
					&emp.Status,
				)

				employees = append(employees, emp)
			}

			json.NewEncoder(w).Encode(employees)
		}

		if r.Method == "POST" {
			var emp Employee

			json.NewDecoder(r.Body).Decode(&emp)

			_, err := db.Exec(
				"INSERT INTO employee (first_name, last_name, email, phone, department_id, position_id, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				emp.FirstName,
				emp.LastName,
				emp.Email,
				emp.Phone,
				emp.DepartmentID,
				emp.PositionID,
				emp.Salary,
				emp.Status,
			)

			if err != nil {
				log.Println(err)
			}

			json.NewEncoder(w).Encode(emp)
		}


		if r.Method == "PUT" {
			id, _ := strconv.Atoi(r.URL.Query().Get("id"))

			var emp Employee

			json.NewDecoder(r.Body).Decode(&emp)

			_, err := db.Exec(
				"UPDATE employee SET first_name=?, last_name=?, email=?, phone=?, department_id=?, position_id=?, salary=?, status=? WHERE id=?",
				emp.FirstName,
				emp.LastName,
				emp.Email,
				emp.Phone,
				emp.DepartmentID,
				emp.PositionID,
				emp.Salary,
				emp.Status,
				id,
			)

			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			emp.ID = id

			json.NewEncoder(w).Encode(emp)
		}


		if r.Method == "DELETE" {
			id, _ := strconv.Atoi(r.URL.Query().Get("id"))

			_, err := db.Exec(
				"DELETE FROM employee WHERE id=?",
				id,
			)

			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			json.NewEncoder(w).Encode(map[string]string{
				"message": "Employee deleted successfully",
			})
		}

	})

	log.Println("Server running on :8080")
	// log.Fatal(http.ListenAndServe(":8080", nil))
	log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}
