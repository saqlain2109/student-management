import { supabase } from '../lib/supabase';

export const api = {
  courses: {
    getAll: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      return data;
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (courseData) => {
      const { data, error } = await supabase.from('courses').insert([courseData]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id, courseData) => {
      const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  students: {
    getAll: async () => {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (studentData) => {
      // 1. Insert Student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();
        
      if (studentError) throw studentError;
      
      // 2. Determine initial fee from the course (if course_id provided)
      let initialFee = 0;
      if (studentData.course_id) {
         const { data: courseData } = await supabase.from('courses').select('fee_amount').eq('id', studentData.course_id).single();
         if (courseData) {
             initialFee = Number(courseData.fee_amount);
         }
      }
      
      // 3. Initialize Fee Record
      const { error: feeError } = await supabase
        .from('fees')
        .insert([{
          student_id: student.id,
          total_amount: initialFee,
          paid_amount: 0,
          status: 'pending'
        }]);
        
      if (feeError) throw feeError;
      
      return student;
    },
    update: async (id, data) => {
      const { data: updated, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    delete: async (id) => {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  fees: {
    getAll: async () => {
      const { data, error } = await supabase.from('fees').select('*');
      if (error) throw error;
      return data;
    },
    getByStudentId: async (studentId) => {
      const { data, error } = await supabase.from('fees').select('*').eq('student_id', studentId).single();
      if (error && error.code !== 'PGRST116') throw error; // ignore no row found error
      return data;
    },
    update: async (id, data) => {
      const { data: updated, error } = await supabase
        .from('fees')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }
  },
  payments: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, students(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getByStudentId: async (studentId) => {
      const { data, error } = await supabase.from('payments').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      // 1. Create Payment Record
      const receiptNumber = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
      const paymentPayload = {
        ...data,
        receipt_number: receiptNumber
      };
      
      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert([paymentPayload])
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
      // 2. Fetch current fee record
      const { data: currentFee } = await supabase
        .from('fees')
        .select('paid_amount')
        .eq('id', data.fee_id)
        .single();
        
      // 3. Update Fee Record
      const newPaidAmount = Number(currentFee.paid_amount) + Number(data.amount_paid);
      
      const { error: updateError } = await supabase
        .from('fees')
        .update({ paid_amount: newPaidAmount })
        .eq('id', data.fee_id);
        
      if (updateError) throw updateError;
      
      return newPayment;
    }
  }
};
