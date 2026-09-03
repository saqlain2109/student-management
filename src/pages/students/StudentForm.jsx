import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { api } from '../../services/api';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(isEditMode);

  const [formData, setFormData] = useState(() => ({
    full_name: '',
    father_name: '',
    mother_name: '',
    dob: '',
    gender: '',
    contact_number: '',
    alternate_contact: '',
    email: '',
    aadhaar_number: '',
    address: '',
    academic_year: new Date().getFullYear().toString(),
    course_id: '',
    admission_number: '',
    roll_number: '',
    image_url: '',
    ...(isEditMode ? {} : {
      admission_number: `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    })
  }));

  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await api.courses.getAll();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses", error);
      }
    };
    loadCourses();

    if (isEditMode) {
      const loadStudent = async () => {
        try {
          const student = await api.students.getById(id);
          if (student) {
            setFormData(student);
          } else {
            navigate('/students');
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      loadStudent();
    }
  }, [id, isEditMode, navigate]);

  // --- Smart Parser Logic ---
  // We extract the Standard and Stream from the flat string: e.g. "12th Standard (Science)" -> Standard: "12th Standard", Stream: "Science"
  const parsedCourses = useMemo(() => {
    return courses.map(course => {
      // Regex matches "Something" or "Something (Inside Brackets)"
      const match = course.name.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      const standard = match[1] ? match[1].trim() : course.name;
      const stream = match[2] ? match[2].trim() : 'General';
      return { ...course, parsedStandard: standard, parsedStream: stream };
    });
  }, [courses]);

  // Unique Standards for Dropdown 1
  const uniqueStandards = useMemo(() => {
    const standards = parsedCourses.map(c => c.parsedStandard);
    return [...new Set(standards)];
  }, [parsedCourses]);

  // Available Streams for Dropdown 2 based on selected Standard
  const availableStreams = useMemo(() => {
    if (!selectedStandard) return [];
    const streams = parsedCourses.filter(c => c.parsedStandard === selectedStandard).map(c => c.parsedStream);
    return [...new Set(streams)];
  }, [selectedStandard, parsedCourses]);

  // When standard or stream changes, find the matched course and suggest Roll Number
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isEditMode && !selectedStandard) return; 
    if (!selectedStandard) return;

    let streamToMatch = selectedStream;
    if (!streamToMatch && availableStreams.length === 1) {
      streamToMatch = availableStreams[0];
    }

    const matchedCourse = parsedCourses.find(c => 
      c.parsedStandard === selectedStandard && c.parsedStream === streamToMatch
    );

    if (matchedCourse) {
      setFormData(prev => {
        // Only suggest Roll Number if it's empty (new student)
        const year = new Date().getFullYear();
        const random = Math.floor(100 + Math.random() * 900);
        const suggestedRoll = prev.roll_number || `${selectedStandard.split(' ')[0]}-${year}-${random}`;
        
        return {
          ...prev,
          course_id: matchedCourse.id,
          course: matchedCourse.name,
          roll_number: suggestedRoll
        };
      });
    }

  }, [selectedStandard, selectedStream, parsedCourses, availableStreams, isEditMode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});

  // ... (existing useEffects)

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.father_name) newErrors.father_name = "Father's Name is required";
    if (!formData.mother_name) newErrors.mother_name = "Mother's Name is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contact_number) newErrors.contact_number = "Contact Number is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.academic_year) newErrors.academic_year = "Academic Year is required";
    if (!formData.roll_number) newErrors.roll_number = "Roll Number is required";
    if (!formData.course_id && !isEditMode) newErrors.course_id = "Please select a Class";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      if (isEditMode) {
        await api.students.update(id, formData);
        navigate(`/students/${id}`);
      } else {
        const newStudent = await api.students.create(formData);
        navigate(`/students/${newStudent.id}`);
      }
    } catch (error) {
      console.error(error);
      if (error.code === '23505') {
        setErrors({ roll_number: "This number is already taken. Generating a new one..." });
        const random = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({
          ...prev,
          admission_number: `ADM-${new Date().getFullYear()}-${random}`,
          roll_number: `${prev.roll_number}-NEW`
        }));
      } else {
        setErrors({ submit: "Failed to save. Please check your internet or data." });
      }
    } finally {
      setSaving(false);
    }
  };

  const matchedCourse = courses.find(c => c.id === formData.course_id);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading form...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{isEditMode ? 'Edit Student' : 'Add New Student'}</h2>
          <p className="text-muted-foreground mt-1">Enter the student's personal and academic details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details as per official documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name (As per Marksheet) *</label>
                    <Input name="full_name" value={formData.full_name || ""} onChange={handleChange} className={errors.full_name ? 'border-destructive' : ''} placeholder="Full Name" />
                    {errors.full_name && <p className="text-[10px] font-bold text-destructive">{errors.full_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aadhaar Number</label>
                    <Input name="aadhaar_number" value={formData.aadhaar_number || ""} onChange={handleChange} placeholder="12-digit Aadhaar" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth *</label>
                    <Input type="date" name="dob" value={formData.dob || ""} onChange={handleChange} className={errors.dob ? 'border-destructive' : ''} />
                    {errors.dob && <p className="text-[10px] font-bold text-destructive">{errors.dob}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender *</label>
                    <select 
                      name="gender" 
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.gender ? 'border-destructive' : ''}`}
                      value={formData.gender || ""} 
                      onChange={handleChange} 
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-[10px] font-bold text-destructive">{errors.gender}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admission Number (Auto-generated)</label>
                    <Input name="admission_number" value={formData.admission_number || ""} readOnly className="bg-muted font-mono font-bold text-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Academic Year *</label>
                    <Input name="academic_year" value={formData.academic_year || ""} onChange={handleChange} className={errors.academic_year ? 'border-destructive' : ''} placeholder="e.g. 2023-24" />
                    {errors.academic_year && <p className="text-[10px] font-bold text-destructive">{errors.academic_year}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.father_name || errors.mother_name ? 'border-destructive/30' : ''}>
              <CardHeader>
                <CardTitle>Parental Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Father's Name *</label>
                  <Input name="father_name" value={formData.father_name || ""} onChange={handleChange} className={errors.father_name ? 'border-destructive' : ''} placeholder="Father's Name" />
                  {errors.father_name && <p className="text-[10px] font-bold text-destructive">{errors.father_name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mother's Name *</label>
                  <Input name="mother_name" value={formData.mother_name || ""} onChange={handleChange} className={errors.mother_name ? 'border-destructive' : ''} placeholder="Mother's Name" />
                  {errors.mother_name && <p className="text-[10px] font-bold text-destructive">{errors.mother_name}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className={errors.contact_number || errors.address ? 'border-destructive/30' : ''}>
              <CardHeader>
                <CardTitle>Contact & Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Number *</label>
                    <Input name="contact_number" value={formData.contact_number || ""} onChange={handleChange} className={errors.contact_number ? 'border-destructive' : ''} placeholder="Main mobile number" />
                    {errors.contact_number && <p className="text-[10px] font-bold text-destructive">{errors.contact_number}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alternate Contact</label>
                    <Input name="alternate_contact" value={formData.alternate_contact || ""} onChange={handleChange} placeholder="Secondary number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email ID</label>
                    <Input type="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="email@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Complete Address *</label>
                  <textarea 
                    name="address" 
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.address ? 'border-destructive' : ''}`}
                    value={formData.address || ""} 
                    onChange={handleChange} 
                    placeholder="Residential address"
                  />
                  {errors.address && <p className="text-[10px] font-bold text-destructive">{errors.address}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Photo attachment (via URL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/10 bg-muted mx-auto flex items-center justify-center relative">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Profile Preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User&background=random'; }}
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </div>
                <Input 
                  name="image_url" 
                  value={formData.image_url || ""} 
                  onChange={handleChange} 
                  placeholder="Paste image URL here" 
                  className="text-center text-xs"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Enrollment & Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Roll Number / ID *</label>
                  <Input name="roll_number" value={formData.roll_number || ""} onChange={handleChange} className={errors.roll_number ? 'border-destructive' : ''} />
                  {errors.roll_number && <p className="text-[10px] font-bold text-destructive">{errors.roll_number}</p>}
                </div>
                
                {!isEditMode && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Select Class</label>
                      <select 
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.course_id ? 'border-destructive' : ''}`}
                        value={selectedStandard || ""} onChange={(e) => { setSelectedStandard(e.target.value); setSelectedStream(''); }}
                      >
                        <option value="">-- Choose --</option>
                        {uniqueStandards.map(std => <option key={std} value={std}>{std}</option>)}
                      </select>
                      {errors.course_id && <p className="text-[10px] font-bold text-destructive">{errors.course_id}</p>}
                    </div>

                    {availableStreams.length > 0 && !(availableStreams.length === 1 && availableStreams[0] === 'General') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Select Stream/Subject *</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={selectedStream} 
                          onChange={(e) => setSelectedStream(e.target.value)} 
                          required
                        >
                          <option value="">-- Choose Stream --</option>
                          {availableStreams.map(stream => (
                            <option key={stream} value={stream}>{stream}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-2 space-y-3">
                  <div className="p-3 bg-muted rounded-md text-[10px] font-bold text-muted-foreground uppercase text-center tracking-widest">
                    {formData.course || 'Select Class First'}
                  </div>
                  
                  {matchedCourse && (
                    <div className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-500/20 text-center animate-in zoom-in-95 duration-300">
                      <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Fee Amount</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">
                        ₹{matchedCourse.fee_amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3 pt-0">
                {errors.submit && (
                  <div className="w-full p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center">
                    {errors.submit}
                  </div>
                )}
                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20" disabled={saving}>
                  {saving ? 'Processing...' : (isEditMode ? 'Update Records' : 'Enroll Student')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
