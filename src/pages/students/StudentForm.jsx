import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    full_name: '',
    roll_number: '',
    admission_number: '',
    course_id: null,
    course: '',
    semester: '',
    phone: '',
    email: '',
    parent_details: '',
    address: '',
    image_url: '',
  });

  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedStream, setSelectedStream] = useState('');

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

  // When standard or stream changes, find the matched course
  useEffect(() => {
    if (isEditMode && !selectedStandard) return; 
    if (!selectedStandard) return;

    let streamToMatch = selectedStream;
    // Auto-select if there's only one stream available (like 'General' for 1st Standard)
    if (!streamToMatch && availableStreams.length === 1) {
      streamToMatch = availableStreams[0];
      setSelectedStream(streamToMatch);
    }

    const matchedCourse = parsedCourses.find(c => 
      c.parsedStandard === selectedStandard && c.parsedStream === streamToMatch
    );

    setFormData(prev => ({
      ...prev,
      course_id: matchedCourse ? matchedCourse.id : null,
      course: matchedCourse ? matchedCourse.name : '',
      semester: matchedCourse ? matchedCourse.standard_or_degree : ''
    }));

  }, [selectedStandard, selectedStream, parsedCourses, availableStreams, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id && !isEditMode) {
      alert("Please select a valid Standard and Stream from the Master Table.");
      return;
    }
    
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
      alert("An error occurred. Make sure Roll Number and Admission Number are unique.");
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
        <div className="grid gap-6 md:grid-cols-3">
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic contact and identification details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Full Name *</label>
                  <Input name="full_name" value={formData.full_name || ''} onChange={handleChange} required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email Address</label>
                  <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="john@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Roll Number *</label>
                  <Input name="roll_number" value={formData.roll_number || ''} onChange={handleChange} required placeholder="BTECH-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Admission Number *</label>
                  <Input name="admission_number" value={formData.admission_number || ''} onChange={handleChange} required placeholder="ADM-2023" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Phone Number</label>
                  <Input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Parent/Guardian Details</label>
                  <Input name="parent_details" value={formData.parent_details || ''} onChange={handleChange} placeholder="Name and relation" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Complete Address</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  name="address" value={formData.address || ''} onChange={handleChange} placeholder="House No, Street, City, Pincode"
                ></textarea>
              </div>

              <div className="space-y-4 pt-6 border-t flex flex-col items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/10 bg-muted flex items-center justify-center relative shrink-0">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Profile Preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User&background=random'; }}
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </div>
                
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium leading-none text-center block">
                    Student Profile Photo (URL)
                  </label>
                  <p className="text-xs text-muted-foreground text-center">
                    Paste an image link here. (Database will only save this URL, not the actual image file).
                  </p>
                  <Input 
                    name="image_url" 
                    value={formData.image_url || ''} 
                    onChange={handleChange} 
                    placeholder="https://example.com/student-photo.jpg" 
                    className="text-center"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Class & Course Selection</CardTitle>
              <CardDescription>Select the class and subject for the student.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {!isEditMode && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Select Class / Standard *</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedStandard} 
                      onChange={(e) => { setSelectedStandard(e.target.value); setSelectedStream(''); }} 
                      required
                    >
                      <option value="">-- Select Standard --</option>
                      {uniqueStandards.map(std => (
                        <option key={std} value={std}>{std}</option>
                      ))}
                    </select>
                    {uniqueStandards.length === 0 && (
                      <p className="text-xs text-destructive">No courses in Master Table.</p>
                    )}
                  </div>

                  {availableStreams.length > 0 && !(availableStreams.length === 1 && availableStreams[0] === 'General') && (
                    <div className="space-y-2 animate-in fade-in">
                      <label className="text-sm font-medium leading-none">Select Stream / Subject *</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedStream} 
                        onChange={(e) => setSelectedStream(e.target.value)} 
                        required
                      >
                        <option value="">-- Select Stream --</option>
                        {availableStreams.map(stream => (
                          <option key={stream} value={stream}>{stream}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Final Assignment</label>
                  <div className="p-3 bg-muted rounded-md text-sm font-medium">
                    {formData.course || 'Not configured'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Category</label>
                  <div className="p-3 bg-muted rounded-md text-sm font-medium">
                    {formData.semester || 'N/A'}
                  </div>
                </div>

                {formData.course_id ? (
                  <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                          Master Course Matched!
                        </p>
                        <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-500">
                          Fee: ₹{matchedCourse?.fee_amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  selectedStandard && (
                    <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                            Incomplete
                          </p>
                          <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-500">
                            Please select a stream.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

            </CardContent>
            <CardFooter className="bg-muted/50 py-4">
              <Button type="submit" className="w-full" disabled={!isEditMode && !formData.course_id}>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Record' : 'Enroll Student'}
              </Button>
            </CardFooter>
          </Card>

        </div>
      </form>
    </div>
  );
};

export default StudentForm;
