import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, Play, CheckCircle2, Filter, Search, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  duration_minutes: number | null;
  instructor_name: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  language: string;
}

interface LearningProgress {
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
}

export default function Learning() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Map<string, LearningProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState('');

  const getYouTubeVideoId = (url: string): string | null => {
    try {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
      return match ? match[1] : null;
    } catch {}
    return null;
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const id = getYouTubeVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    const id = getYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const openVideo = (title: string, videoUrl: string | null) => {
    if (!videoUrl) return;
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (embedUrl) {
      setActiveVideoTitle(title);
      setActiveVideoUrl(embedUrl);
      setVideoDialogOpen(true);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchProgress();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('course_id, progress_percentage, is_completed')
        .eq('user_id', user!.id);

      if (error) throw error;
      
      const progressMap = new Map<string, LearningProgress>();
      data?.forEach((p) => {
        progressMap.set(p.course_id, p);
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const startCourse = async (course: Course) => {
    try {
      const existing = progress.get(course.id);
      if (!existing) {
        await supabase.from('learning_progress').insert({
          user_id: user!.id,
          course_id: course.id,
          progress_percentage: 10,
        });
        
        setProgress(new Map(progress.set(course.id, {
          course_id: course.id,
          progress_percentage: 10,
          is_completed: false,
        })));
      }
      
      openVideo(course.title, course.video_url);
      toast({
        title: 'Course Started',
        description: 'Good luck with your learning!',
      });
    } catch (error) {
      console.error('Error starting course:', error);
    }
  };

  const completeCourse = async (course: Course) => {
    try {
      await supabase
        .from('learning_progress')
        .update({
          progress_percentage: 100,
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id)
        .eq('course_id', course.id);

      setProgress(new Map(progress.set(course.id, {
        course_id: course.id,
        progress_percentage: 100,
        is_completed: true,
      })));

      openVideo(course.title, course.video_url);
      toast({
        title: 'Congratulations! 🎉',
        description: 'You have completed this course!',
      });
    } catch (error) {
      console.error('Error completing course:', error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    const matchesLanguage = languageFilter === 'all' || course.language === languageFilter;
    return matchesSearch && matchesCategory && matchesLevel && matchesLanguage;
  });

  const languages = [
    { value: 'english', label: 'English 🇬🇧' },
    { value: 'hindi', label: 'हिन्दी 🇮🇳' },
    { value: 'telugu', label: 'తెలుగు 🇮🇳' },
  ];

  const categories = [
    { value: 'business_basics', label: 'Business Basics' },
    { value: 'digital_skills', label: 'Digital Skills' },
    { value: 'financial_literacy', label: 'Financial Literacy' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'product_development', label: 'Product Development' },
    { value: 'communication', label: 'Communication' },
    { value: 'legal', label: 'Legal' },
    { value: 'other', label: 'Other' },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      business_basics: 'bg-blue-100 text-blue-800',
      digital_skills: 'bg-purple-100 text-purple-800',
      financial_literacy: 'bg-green-100 text-green-800',
      marketing: 'bg-orange-100 text-orange-800',
      product_development: 'bg-pink-100 text-pink-800',
      communication: 'bg-yellow-100 text-yellow-800',
      legal: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  const getLevelBadge = (level: string) => {
    const badges: Record<string, string> = {
      beginner: 'badge-success',
      intermediate: 'badge-warning',
      advanced: 'badge-primary',
    };
    return badges[level] || '';
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Learning Center 📚
          </h1>
          <p className="text-muted-foreground">
            Develop skills to grow your business with our curated courses.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseProgress = progress.get(course.id);
              const isCompleted = courseProgress?.is_completed;
              const progressPercent = courseProgress?.progress_percentage || 0;

              return (
                <Card key={course.id} className="card-warm overflow-hidden group">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                    {(course.thumbnail_url || (course.video_url && getYouTubeThumbnail(course.video_url))) ? (
                      <img
                        src={course.thumbnail_url || getYouTubeThumbnail(course.video_url!)!}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-primary/50" />
                    )}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-success text-success-foreground rounded-full p-1">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(course.category)} variant="secondary">
                        {categories.find((c) => c.value === course.category)?.label}
                      </Badge>
                      <Badge className={getLevelBadge(course.level)} variant="outline">
                        {course.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {languages.find((l) => l.value === course.language)?.label || course.language}
                      </Badge>
                    </div>
                    <CardTitle className="font-heading text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {course.instructor_name && (
                        <span>By {course.instructor_name}</span>
                      )}
                      {course.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration_minutes} min
                        </span>
                      )}
                    </div>
                    
                    {progressPercent > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    {isCompleted ? (
                      <Button 
                        variant="success" 
                        className="w-full" 
                        onClick={() => openVideo(course.title, course.video_url)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rewatch Video
                      </Button>
                    ) : progressPercent > 0 ? (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => completeCourse(course)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continue & Complete
                      </Button>
                    ) : (
                      <Button
                        variant="hero"
                        className="w-full"
                        onClick={() => startCourse(course)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Course
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Video Player Dialog */}
        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>{activeVideoTitle}</DialogTitle>
              <DialogDescription className="sr-only">Playing video: {activeVideoTitle}</DialogDescription>
            </DialogHeader>
            <div className="aspect-video w-full">
              {activeVideoUrl && (
                <iframe
                  src={activeVideoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeVideoTitle}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
