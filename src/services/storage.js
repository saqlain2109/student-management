import { v4 as uuidv4 } from 'uuid';

const STUDENTS_KEY = 'edu_students';
const FEES_KEY = 'edu_fees';

// --- Helper Functions ---
const getItems = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveItems = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// --- Students Service ---
export const getStudents = () => {
  return getItems(STUDENTS_KEY);
};

export const getStudentById = (id) => {
  const students = getStudents();
  return students.find(s => s.id === id);
};

export const saveStudent = (studentData) => {
  const students = getStudents();
  if (studentData.id) {
    const index = students.findIndex(s => s.id === studentData.id);
    if (index !== -1) {
      students[index] = { ...students[index], ...studentData, updatedAt: new Date().toISOString() };
      saveItems(STUDENTS_KEY, students);
      return students[index];
    }
  }
  
  const newStudent = {
    ...studentData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  students.push(newStudent);
  saveItems(STUDENTS_KEY, students);
  
  // Initialize fee record for new student
  initializeFeeRecord(newStudent.id);
  
  return newStudent;
};

export const deleteStudent = (id) => {
  const students = getStudents();
  const filtered = students.filter(s => s.id !== id);
  saveItems(STUDENTS_KEY, filtered);
  
  // Optional: delete associated fees
  const fees = getFees();
  saveItems(FEES_KEY, fees.filter(f => f.studentId !== id));
};

// --- Fees Service ---
export const getFees = () => {
  return getItems(FEES_KEY);
};

export const getFeeRecordByStudentId = (studentId) => {
  const fees = getFees();
  return fees.find(f => f.studentId === studentId);
};

export const initializeFeeRecord = (studentId) => {
  const fees = getFees();
  if (!fees.find(f => f.studentId === studentId)) {
    fees.push({
      id: uuidv4(),
      studentId,
      totalFees: 0,
      feesPaid: 0,
      installments: [], // { id, amount, date, receiptNo }
      fineAmount: 0,
    });
    saveItems(FEES_KEY, fees);
  }
};

export const updateFeeRecord = (studentId, data) => {
  const fees = getFees();
  const index = fees.findIndex(f => f.studentId === studentId);
  if (index !== -1) {
    fees[index] = { ...fees[index], ...data };
    saveItems(FEES_KEY, fees);
    return fees[index];
  }
  return null;
};

export const recordPayment = (studentId, amount) => {
  const fees = getFees();
  const index = fees.findIndex(f => f.studentId === studentId);
  
  if (index !== -1) {
    const record = fees[index];
    const receiptNo = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newInstallment = {
      id: uuidv4(),
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      receiptNo
    };
    
    record.feesPaid += parseFloat(amount);
    record.installments.push(newInstallment);
    
    saveItems(FEES_KEY, fees);
    return { record, newInstallment };
  }
  return null;
};

// Initialize with some dummy data if empty
export const initializeDummyData = () => {
  if (getStudents().length === 0) {
    saveStudent({
      fullName: 'John Doe',
      rollNumber: 'CS-2023-001',
      admissionNumber: 'ADM1001',
      course: 'Computer Science',
      semester: '3rd',
      phoneNumber: '1234567890',
      parentDetails: 'Jane Doe (Mother)',
      address: '123 Campus Drive, Tech City',
    });
    
    const students = getStudents();
    const john = students[0];
    
    updateFeeRecord(john.id, {
      totalFees: 50000,
      feesPaid: 20000,
      installments: [
        { id: uuidv4(), amount: 20000, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), receiptNo: 'REC-1000' }
      ]
    });
  }
};
