// "use client";

// import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

// interface Employee {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
//   department_id: number;
//   position_id: number;
//   department_name?: string;
//   position_name?: string;
//   salary: number;
//   status: "active" | "inactive";
// }

// interface OptionItem {
//   id: number;
//   name: string;
// }

// interface EmployeeForm {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
//   department_id: number;
//   position_id: number;
//   salary: number;
//   status: "active" | "inactive";
// }

// const API_URL = "http://localhost:8080/api";

// const emptyForm: EmployeeForm = {
//   first_name: "",
//   last_name: "",
//   email: "",
//   phone: "",
//   department_id: 0,
//   position_id: 0,
//   salary: 0,
//   status: "active",
// };

// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

// function getErrorMessage(error: unknown): string {
//   return error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
// }

// async function request<T>(url: string, options?: RequestInit): Promise<T> {
//   const response = await fetch(url, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...options?.headers,
//     },
//   });

//   if (!response.ok) {
//     let message = `Request failed (${response.status})`;
//     try {
//       const body = await response.json();
//       message = body.message || body.error || message;
//     } catch {
//       // Response may not contain JSON.
//     }
//     throw new Error(message);
//   }

//   if (response.status === 204) return undefined as T;

//   const text = await response.text();
//   return (text ? JSON.parse(text) : undefined) as T;
// }

// export default function EmployeePage() {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [departments, setDepartments] = useState<OptionItem[]>([]);
//   const [positions, setPositions] = useState<OptionItem[]>([]);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [form, setForm] = useState<EmployeeForm>(emptyForm);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const refreshData = useCallback(async () => {
//     const [employeeData, departmentData, positionData] = await Promise.all([
//       request<Employee[]>(`${API_URL}/employees`),
//       request<OptionItem[]>(`${API_URL}/departments`),
//       request<OptionItem[]>(`${API_URL}/positions`),
//     ]);

//     setEmployees(Array.isArray(employeeData) ? employeeData : []);
//     setDepartments(Array.isArray(departmentData) ? departmentData : []);
//     setPositions(Array.isArray(positionData) ? positionData : []);
//   }, []);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadInitialData() {
//       setLoading(true);
//       setError("");

//       try {
//         const [employeeData, departmentData, positionData] = await Promise.all([
//           request<Employee[]>(`${API_URL}/employees`),
//           request<OptionItem[]>(`${API_URL}/departments`),
//           request<OptionItem[]>(`${API_URL}/positions`),
//         ]);

//         if (!cancelled) {
//           setEmployees(Array.isArray(employeeData) ? employeeData : []);
//           setDepartments(Array.isArray(departmentData) ? departmentData : []);
//           setPositions(Array.isArray(positionData) ? positionData : []);
//         }
//       } catch (err) {
//         if (!cancelled) setError(getErrorMessage(err));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadInitialData();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const filteredEmployees = useMemo(() => {
//     const keyword = search.trim().toLowerCase();
//     if (!keyword) return employees;

//     return employees.filter((employee) => {
//       const searchable = [
//         employee.id,
//         employee.first_name,
//         employee.last_name,
//         employee.email,
//         employee.phone,
//         employee.department_name,
//         employee.position_name,
//         employee.status,
//       ]
//         .join(" ")
//         .toLowerCase();

//       return searchable.includes(keyword);
//     });
//   }, [employees, search]);

//   const resetForm = () => {
//     setEditingId(null);
//     setForm({
//       ...emptyForm,
//       department_id: departments[0]?.id ?? 0,
//       position_id: positions[0]?.id ?? 0,
//     });
//     setError("");
//     setSuccess("");
//   };

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (submitting) return;

//     if (!form.department_id || !form.position_id) {
//       setError("กรุณาเลือกแผนกและตำแหน่ง");
//       return;
//     }

//     if (form.salary < 0) {
//       setError("เงินเดือนต้องไม่ติดลบ");
//       return;
//     }

//     setSubmitting(true);
//     setError("");
//     setSuccess("");

//     const url = editingId
//       ? `${API_URL}/employees/${editingId}`
//       : `${API_URL}/employees`;

//     try {
//       await request(url, {
//         method: editingId ? "PUT" : "POST",
//         body: JSON.stringify({
//           ...form,
//           department_id: Number(form.department_id),
//           position_id: Number(form.position_id),
//           salary: Number(form.salary),
//         }),
//       });

//       await refreshData();
//       resetForm();
//       setSuccess(editingId ? "แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว" : "เพิ่มพนักงานเรียบร้อยแล้ว");
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (employee: Employee) => {
//     setEditingId(employee.id);
//     setForm({
//       first_name: employee.first_name ?? "",
//       last_name: employee.last_name ?? "",
//       email: employee.email ?? "",
//       phone: employee.phone ?? "",
//       department_id: Number(employee.department_id),
//       position_id: Number(employee.position_id),
//       salary: Number(employee.salary ?? 0),
//       status: employee.status,
//     });
//     setError("");
//     setSuccess("");
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (id: number) => {
//     const confirmed = window.confirm("ยืนยันการลบข้อมูลพนักงานคนนี้?");
//     if (!confirmed || deletingId !== null) return;

//     setDeletingId(id);
//     setError("");
//     setSuccess("");

//     try {
//       await request(`${API_URL}/employees/${id}`, { method: "DELETE" });
//       await refreshData();
//       if (editingId === id) resetForm();
//       setSuccess("ลบข้อมูลพนักงานเรียบร้อยแล้ว");
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const activeCount = employees.filter((employee) => employee.status === "active").length;

//   return (
//     <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-6xl space-y-7">
//         {/* Header */}
//         <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
//               Human Resources
//             </p>
//             <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//               ระบบจัดการข้อมูลพนักงาน
//             </h1>
//             <p className="mt-1 text-sm text-slate-500">
//               เพิ่ม แก้ไข ลบ และตรวจสอบข้อมูลบุคลากรในองค์กร
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-xs text-slate-500">พนักงานทั้งหมด</p>
//               <p className="mt-1 text-xl font-bold text-slate-900">{employees.length} คน</p>
//             </div>
//             <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
//               <p className="text-xs text-emerald-700">ปฏิบัติงาน</p>
//               <p className="mt-1 text-xl font-bold text-emerald-800">{activeCount} คน</p>
//             </div>
//           </div>
//         </header>

//         {/* Alerts */}
//         {error && (
//           <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             <span>{error}</span>
//             <button type="button" onClick={() => setError("")} className="font-bold">✕</button>
//           </div>
//         )}
//         {success && (
//           <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
//             <span>{success}</span>
//             <button type="button" onClick={() => setSuccess("")} className="font-bold">✕</button>
//           </div>
//         )}

//         {/* Form */}
//         <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
//             <div>
//               <h2 className="font-semibold text-slate-800">
//                 {editingId ? `แก้ไขข้อมูลพนักงาน (รหัส #${editingId})` : "เพิ่มพนักงานใหม่"}
//               </h2>
//               <p className="mt-0.5 text-xs text-slate-500">กรอกข้อมูลให้ครบถ้วนก่อนบันทึก</p>
//             </div>
//             <span className={`rounded-full px-3 py-1 text-xs font-semibold ${editingId ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
//               {editingId ? "EDIT MODE" : "NEW EMPLOYEE"}
//             </span>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6">
//             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//               <div>
//                 <label htmlFor="first_name" className="mb-1.5 block text-xs font-semibold text-slate-600">ชื่อจริง *</label>
//                 <input id="first_name" type="text" required maxLength={100} placeholder="เช่น สมชาย" className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
//               </div>

//               <div>
//                 <label htmlFor="last_name" className="mb-1.5 block text-xs font-semibold text-slate-600">นามสกุล *</label>
//                 <input id="last_name" type="text" required maxLength={100} placeholder="เช่น ใจดี" className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
//               </div>

//               <div>
//                 <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-600">อีเมล *</label>
//                 <input id="email" type="email" required maxLength={150} placeholder="name@company.com" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
//               </div>

//               <div>
//                 <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-slate-600">เบอร์โทรศัพท์ *</label>
//                 <input id="phone" type="tel" required maxLength={20} placeholder="08X-XXX-XXXX" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
//               </div>

//               <div>
//                 <label htmlFor="department_id" className="mb-1.5 block text-xs font-semibold text-slate-600">แผนก *</label>
//                 <select id="department_id" required className={inputClass} value={form.department_id} onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}>
//                   <option value={0} disabled>เลือกแผนก</option>
//                   {departments.map((department) => (
//                     <option key={department.id} value={department.id}>{department.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="position_id" className="mb-1.5 block text-xs font-semibold text-slate-600">ตำแหน่ง *</label>
//                 <select id="position_id" required className={inputClass} value={form.position_id} onChange={(e) => setForm({ ...form, position_id: Number(e.target.value) })}>
//                   <option value={0} disabled>เลือกตำแหน่ง</option>
//                   {positions.map((position) => (
//                     <option key={position.id} value={position.id}>{position.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="salary" className="mb-1.5 block text-xs font-semibold text-slate-600">เงินเดือน (บาท) *</label>
//                 <input id="salary" type="number" required min={0} step="0.01" placeholder="0" className={inputClass} value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
//               </div>

//               <div>
//                 <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-slate-600">สถานะการทำงาน</label>
//                 <select id="status" className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeForm["status"] })}>
//                   <option value="active">Active (ปฏิบัติงาน)</option>
//                   <option value="inactive">Inactive (พ้นสภาพ/พักงาน)</option>
//                 </select>
//               </div>
//             </div>

//             <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
//               {editingId !== null && (
//                 <button type="button" onClick={resetForm} disabled={submitting} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
//                   ยกเลิก
//                 </button>
//               )}
//               <button type="submit" disabled={submitting || loading} className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
//                 {submitting ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "+ เพิ่มพนักงาน"}
//               </button>
//             </div>
//           </form>
//         </section>

//         {/* Employee table */}
//         <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h2 className="font-semibold text-slate-800">รายชื่อพนักงาน</h2>
//               <p className="mt-0.5 text-xs text-slate-500">แสดง {filteredEmployees.length} จาก {employees.length} รายการ</p>
//             </div>
//             <div className="flex gap-2">
//               <input type="search" aria-label="ค้นหาพนักงาน" placeholder="ค้นหาชื่อ อีเมล เบอร์โทร..." className={`${inputClass} min-w-0 sm:w-72`} value={search} onChange={(e) => setSearch(e.target.value)} />
//               <button type="button" onClick={() => { setLoading(true); refreshData().catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }} className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
//                 รีเฟรช
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[850px] border-collapse text-left text-sm">
//               <thead>
//                 <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   <th className="px-6 py-4">พนักงาน</th>
//                   <th className="px-6 py-4">แผนก / ตำแหน่ง</th>
//                   <th className="px-6 py-4">ข้อมูลติดต่อ</th>
//                   <th className="px-6 py-4 text-right">เงินเดือน</th>
//                   <th className="px-6 py-4 text-center">สถานะ</th>
//                   <th className="px-6 py-4 text-right">จัดการ</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {loading ? (
//                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">กำลังโหลดข้อมูล...</td></tr>
//                 ) : filteredEmployees.length === 0 ? (
//                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">{search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลพนักงาน"}</td></tr>
//                 ) : (
//                   filteredEmployees.map((employee) => (
//                     <tr key={employee.id} className="transition hover:bg-slate-50/70">
//                       <td className="px-6 py-4">
//                         <p className="font-semibold text-slate-800">{employee.first_name} {employee.last_name}</p>
//                         <p className="mt-0.5 text-xs text-slate-400">รหัส #{employee.id}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-slate-700">{employee.department_name || "-"}</p>
//                         <p className="mt-0.5 text-xs text-slate-400">{employee.position_name || "-"}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-slate-700">{employee.email}</p>
//                         <p className="mt-0.5 text-xs text-slate-400">{employee.phone}</p>
//                       </td>
//                       <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-700">
//                         {Number(employee.salary).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${employee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
//                           {employee.status === "active" ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <div className="flex justify-end gap-2">
//                           <button type="button" onClick={() => handleEdit(employee)} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">
//                             แก้ไข
//                           </button>
//                           <button type="button" onClick={() => handleDelete(employee.id)} disabled={deletingId === employee.id} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50">
//                             {deletingId === employee.id ? "กำลังลบ..." : "ลบ"}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }







// "use client"

// import { useEffect, useState } from "react";
// interface Employee {
//     id: number;
//     first_name: string;
//     last_name: string;
//     email: string;
//     phone: string;
//     department_id: number;
//     position_id: number;
//     salary: number;
//     status: "active" | "inactive";
// }

// interface EmployeeForm {
//     name: string;
//     email: string;
//     salary: number
// }




// export default function EmployeePage() {
//     const [employees, setEmployees] = useState<Employee[]>([]);
//     const [form, setForm] = useState<EmployeeForm>({
//         name: "",
//         email:"",
//         salary:0
//     })
//     useEffect(() => {
//         let ignore = false;

//         fetch("http://localhost:8080/api/employees")
//             .then((res) => {
//             if (!res.ok) throw new Error("Failed to fetch");
//             return res.json();
//             })
//             .then((data: Employee[]) => {
//             if (!ignore) setEmployees(data);
//             })
//             .catch(console.error);

//         return () => {
//             ignore = true; // กัน setState หลัง component ถูกถอดออก
//         };
//     }, []);
//   return (
//     <div>
//       {employees.map((item) => (
//   <tr key={item.id}>
//     <td>{item.first_name}</td>
//     <td>{item.email}</td>
//     <td>{item.salary}</td>
//   </tr>
// ))}
//     </div>
//   )
// }

"use client"


import React, { useEffect, useState } from 'react'

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department_id: number;
    position_id: number;
    salary: number;
    status:"active"|"inactive"
}

interface Form {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department_id: number;
    position_id: number;
    salary: number;
    status:"active"|"inactive"
}
export default function EmployeePage() {

    const [employee, setEmployees] = useState<Employee[]>([]);
    const [form, setForm] = useState({
          first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    position_id: "",
    salary: "",
    status:"active",
    })

    const [editId, setEditId] = useState<number | null>(null);
    const handleEdit = (emp: Employee) => {
        setEditId(emp.id);

        setForm({
            first_name:emp.first_name,
            last_name:emp.last_name,
            email:emp.email,
            phone:emp.phone,
            department_id:String(emp.department_id),
            position_id:String(emp.position_id),
            salary:String(emp.salary),
            status:emp.status,
        })
    }
    useEffect(() => {
    const fetchEmployees = async () => {
        const res = await fetch("http://localhost:8080/api/employees");
        const data = await res.json();

        setEmployees(data)
    }

        fetchEmployees();
    }, [])
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editId
            ? `http://localhost:8080/api/employees/${editId}`
            : "http://localhost:8080/api/employees"
        
        const method = editId ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...form,
                department_id: Number(form.department_id),
                position_id:Number(form.position_id),
                salary:Number(form.salary),
            }),
        })

        // await fetch("http://localhost:8080/api/employees", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         ...form,
        //         department_id: Number(form.department_id),
        //         position_id:Number(form.position_id),
        //         salary:Number(form.salary),
        //     }),
        // });

        await fetch("http://localhost:8080/api/employees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...form,
                department_id: Number(form.department_id),
                position_id:Number(form.position_id),
                salary:Number(form.salary),
            }),
        });

          setForm({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                department_id:"",
                position_id:"",
                salary:"",
                status:"active",
          });
        
        const res = await fetch("http://localhost:8080/api/employees");
        const data = await res.json();
        setEmployees(data)

    }


    const handleDelete = async (id: number) => {
        await fetch(`http://localhost:8080/api/employees?id=${id}`, {
            method: "DELETE",
        });

        const res = await fetch("http://localhost:8080/api/employees");
        const data = await res.json();

        setEmployees(data);
    };

  return (
    <div>
          {employee.map((item, id) => (
              <div key={item.email || id}>
                  <span>
                      
                  {item.first_name} {item.last_name} {item.phone} {}
                  </span>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
              </div>   
          ))}
          <form onSubmit={handleSubmit}>
                first_name <input value={form.first_name} onChange={(e) => setForm({...form,first_name:e.target.value})}/>
                last_name <input value={form.last_name} onChange={(e) => setForm({...form,last_name:e.target.value})}/>
                phone <input value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})}/>
                email <input value={form.email} onChange={(e) => setForm({...form,email:e.target.value})}/>
                salary <input value={form.salary} onChange={(e) => setForm({...form,salary:e.target.value})}/>
                department_id <input value={form.department_id} onChange={(e) => setForm({...form,department_id:e.target.value})}/>
                position_id <input value={form.position_id} onChange={(e) => setForm({...form,position_id:e.target.value})}/>
              status <input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              
              <button type="submit">
                  {editId ? "up" : "add"}
              </button>
        </form>
    </div>
  )
}

