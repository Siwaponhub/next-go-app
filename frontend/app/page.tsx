"use client";

import { useEffect, useState } from "react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  position_id: number;
  salary: number;
  status: "active" | "inactive";
}

type Form = Omit<Employee, "id">;

const API = "/api/employees";

const initialForm: Form = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department_id: 0,
  position_id: 0,
  salary: 0,
  status: "active",
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<Form>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);

  // GET
  const getEmployees = async () => {
    const res = await fetch(API);
    setEmployees(await res.json());
  };

    useEffect(() => {
    const loadData = async () => {
        const res = await fetch(API);
        const data = await res.json();
        setEmployees(data);
    };

    loadData();
    }, []);

  // INPUT
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // EDIT
  const handleEdit = (emp: Employee) => {
    const { id, ...data } = emp;
    setEditId(id);
    setForm(data);
  };

  // ADD / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(editId ? `${API}?id=${editId}` : API, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        department_id: Number(form.department_id),
        position_id: Number(form.position_id),
        salary: Number(form.salary),
      }),
    });

    setForm(initialForm);
    setEditId(null);
    getEmployees();
  };

  // DELETE
  const handleDelete = async (id: number) => {
    await fetch(`${API}?id=${id}`, { method: "DELETE" });
    getEmployees();
  };

  return (
    <div>
      {employees.map((item) => (
        <div key={item.id}>
          {item.first_name} {item.last_name} {item.phone}
          <button onClick={() => handleEdit(item)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        {Object.keys(initialForm)
          .filter((key) => key !== "status")
          .map((key) => (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={form[key as keyof Form]}
              onChange={handleChange}
            />
          ))}

        <select name="status" value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Form["status"] })}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button type="submit">
          {editId ? "Update" : "Add"}
        </button>

        {editId && (
          <button type="button" onClick={() => {
            setEditId(null);
            setForm(initialForm);
          }}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}


