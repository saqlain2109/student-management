import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CreditCard, Mail, Phone, MapPin, FileText, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { api } from '../../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await api.students.getById(id);
        if (data) {
          setStudent(data);
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
  }, [id, navigate]);

  if (loading || !student) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/students">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Profile</h2>
            <p className="text-muted-foreground mt-1">Detailed view of student information.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/fees/record/${student.id}`}>
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Manage Fees
            </Button>
          </Link>
          <Link to={`/students/${student.id}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <Card className="col-span-1 border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-2 border-primary/20">
                {student.image_url ? (
                  <img src={student.image_url} alt={student.full_name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                ) : null}
                <UserCircle className={`h-16 w-16 ${student.image_url ? 'hidden' : 'block'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{student.full_name}</h3>
                <p className="text-primary font-medium">{student.roll_number}</p>
                <div className="mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  Active Enrolled
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-4 border-t pt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Course</span>
                <span className="font-medium text-sm">{student.course}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Semester</span>
                <span className="font-medium text-sm">{student.semester}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Admission No</span>
                <span className="font-medium text-sm">{student.admission_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date Joined</span>
                <span className="font-medium text-sm">{new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Detailed Info */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal & Parental Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Father's Name</p>
                  <p className="text-sm font-medium">{student.father_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Mother's Name</p>
                  <p className="text-sm font-medium">{student.mother_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Aadhaar Number</p>
                  <p className="text-sm font-medium">{student.aadhaar_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm font-medium">{student.dob || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm font-medium">{student.gender || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Academic Year</p>
                  <p className="text-sm font-medium">{student.academic_year || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="text-sm font-medium">{student.contact_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Alternate Contact</p>
                  <p className="text-sm font-medium">{student.alternate_contact || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="text-sm font-medium">{student.email || 'N/A'}</p>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center gap-3 rounded-lg border p-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Residential Address</p>
                  <p className="text-sm font-medium">{student.address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
