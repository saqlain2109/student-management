import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { api } from '../../services/api';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    standard_or_degree: '',
    fee_amount: ''
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadCourses();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.standard_or_degree || !formData.fee_amount) return;
    
    try {
      if (editCourseId) {
        await api.courses.update(editCourseId, {
          name: formData.name,
          standard_or_degree: formData.standard_or_degree,
          fee_amount: parseFloat(formData.fee_amount)
        });
      } else {
        await api.courses.create({
          name: formData.name,
          standard_or_degree: formData.standard_or_degree,
          fee_amount: parseFloat(formData.fee_amount)
        });
      }
      setFormData({ name: '', standard_or_degree: '', fee_amount: '' });
      setEditCourseId(null);
      setIsFormOpen(false);
      loadCourses();
    } catch (error) {
      console.error(error);
      alert("Failed to save course");
    }
  };

  const openAddForm = () => {
    setFormData({ name: '', standard_or_degree: '', fee_amount: '' });
    setEditCourseId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (course) => {
    setFormData({
      name: course.name,
      standard_or_degree: course.standard_or_degree,
      fee_amount: course.fee_amount
    });
    setEditCourseId(course.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course? Students enrolled in it might lose their course reference.")) {
      try {
        await api.courses.delete(id);
        loadCourses();
      } catch (error) {
        console.error(error);
        alert("Failed to delete course");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Courses</h2>
          <p className="text-muted-foreground mt-1">Manage the list of available standards, degrees, and their default fees.</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editCourseId ? 'Edit Course' : 'Add New Course'}</CardTitle>
                <CardDescription>{editCourseId ? 'Update standard or degree details.' : 'Create a new standard or degree program.'}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
                &times;
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Name / Stream</label>
                  <Input 
                    placeholder="e.g. 1st Standard, 12th Standard (Science)" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category / Level</label>
                  <Input 
                    placeholder="e.g. Primary, Higher Secondary, Graduation" 
                    value={formData.standard_or_degree}
                    onChange={(e) => setFormData({...formData, standard_or_degree: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Fee Amount (INR)</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 15000" 
                    value={formData.fee_amount}
                    onChange={(e) => setFormData({...formData, fee_amount: e.target.value})}
                    required 
                    min="0"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  <Button type="submit">
                    {editCourseId ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" /> Update Course
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add Course
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Available Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name / Stream</TableHead>
                <TableHead>Category / Level</TableHead>
                <TableHead>Course Fees</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : courses.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No courses defined yet.</TableCell></TableRow>
              ) : (
                courses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell className="font-semibold">{course.name}</TableCell>
                    <TableCell>{course.standard_or_degree}</TableCell>
                    <TableCell>{formatCurrency(course.fee_amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(course)} className="text-muted-foreground hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesList;
