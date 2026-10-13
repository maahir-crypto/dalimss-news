import React, { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import {
  PlayCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  StarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Lesson {
  id: number;
  title: string;
  duration: number | null;
  isFree: boolean;
  order: number;
  videoUrl: string | null;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  shortDesc: string | null;
  instructor: string;
  price: number;
  duration: string;
  level: string;
  students: number;
  rating: number;
  highlights: string;
  requirements: string | null;
  whatYouLearn: string | null;
  thumbnail: string | null;
  promoVideo: string | null;
  modules: Module[];
}

interface Props {
  course: Course | null;
  isEnrolled: boolean;
  totalLessons: number;
  totalDuration: number;
}

const CourseDetailPage: React.FC<Props> = ({ course, isEnrolled, totalLessons, totalDuration }) => {
  const { data: session } = useSession();
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">This course doesn't exist or has been removed.</p>
          <Link href="/" className="text-red-600 hover:text-red-700 font-semibold">
            ← Back to Dalimss News
          </Link>
        </div>
      </div>
    );
  }

  const highlights = JSON.parse(course.highlights || "[]");
  const requirements = JSON.parse(course.requirements || "[]");
  const whatYouLearn = JSON.parse(course.whatYouLearn || "[]");

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return null;

    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const handleEnrollClick = () => {
    if (isEnrolled) {
      window.location.href = `/learn/${course.slug}`;
      return;
    }

    setShowPaymentModal(true);
    
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
      });
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
          userId: (session?.user as any)?.id || null,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dalimss Academy",
        description: course.title,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                enrollmentId: orderData.enrollmentId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert("Payment successful! Redirecting to course...");
              window.location.href = `/learn/${course.slug}`;
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#dc2626",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', function (response: any){
        alert("Payment failed: " + response.error.description);
      });

    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{course.title} | Dalimss Academy</title>
        <meta name="description" content={course.shortDesc || course.description.substring(0, 160)} />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <Link href="/courses" className="text-gray-400 hover:text-white text-sm">
                    ← Back to Courses
                  </Link>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-gray-300 mb-6">{course.shortDesc || course.description.substring(0, 200)}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-5 w-5" />
                    <span>{formatDuration(totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AcademicCapIcon className="h-5 w-5" />
                    <span>{course.level}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-400">Created by {course.instructor}</p>
              </div>

              {/* Right: Price Card (Desktop) */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-xl shadow-2xl p-6 sticky top-4">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      ₹{course.price.toLocaleString()}
                    </div>
                    {isEnrolled && (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Enrolled
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleEnrollClick}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg transition-all mb-4"
                  >
                    {isEnrolled ? "Continue Learning" : "Enroll Now"}
                  </button>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      <span>Mobile and desktop access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              {whatYouLearn.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {whatYouLearn.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Content */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Content</h2>
                <p className="text-gray-600 mb-6">
                  {course.modules.length} modules • {totalLessons} lessons • {formatDuration(totalDuration)} total length
                </p>

                <div className="space-y-2">
                  {course.modules.map((module) => {
                    const isExpanded = expandedModules.includes(module.id);
                    const moduleDuration = module.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0);

                    return (
                      <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            )}
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900">{module.title}</h3>
                              <p className="text-sm text-gray-500">
                                {module.lessons.length} lessons • {formatDuration(moduleDuration)}
                              </p>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            {module.lessons.map((lesson) => {
                              const canView = isEnrolled || lesson.isFree;
                              
                              return (
                                <div
                                  key={lesson.id}
                                  className={`transition-colors border-b border-gray-100 last:border-0`}
                                >
                                  <div
                                    className={`flex items-center justify-between p-4 ${
                                      canView ? 'hover:bg-white' : 'bg-gray-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <PlayCircleIcon className={`h-5 w-5 ${canView ? 'text-gray-400' : 'text-gray-300'}`} />
                                      <span className={canView ? 'text-gray-700' : 'text-gray-500'}>
                                        {lesson.title}
                                      </span>
                                      {lesson.isFree && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                          FREE
                                        </span>
                                      )}
                                      {!canView && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                          🔒 Locked
                                        </span>
                                      )}
                                    </div>
                                    {canView && lesson.duration && (
                                      <span className="text-sm text-gray-500">
                                        {formatDuration(lesson.duration)}
                                      </span>
                                    )}
                                    {!canView && (
                                      <span className="text-xs text-gray-400">
                                        Enroll to access
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Show YouTube video for accessible lessons */}
                                  {canView && lesson.videoUrl && getYouTubeEmbedUrl(lesson.videoUrl) && (
                                    <div className="p-4 pt-0">
                                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                                        <iframe
                                          src={getYouTubeEmbedUrl(lesson.videoUrl) || ""}
                                          className="w-full h-full"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          title={lesson.title}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirements */}
              {requirements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-gray-400">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              </div>
            </div>

            {/* Sidebar (Mobile Sticky Bottom) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4" />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{course.price.toLocaleString()}</div>
              {isEnrolled && (
                <span className="text-xs text-green-600 font-semibold">✓ Enrolled</span>
              )}
            </div>
            <button
              onClick={handleEnrollClick}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              {isEnrolled ? "Continue" : "Enroll Now"}
            </button>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Enroll Now</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.title}</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Course Fee</span>
                    <span className="text-2xl font-bold text-red-600">₹{course.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">One-time payment • Lifetime access</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : `Pay ₹${course.price.toLocaleString()}`}
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    Secure payment powered by Razorpay
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const slug = params?.slug as string;

  try {
    const course = await (prisma as any).course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                isFree: true,
                order: true,
                videoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      res.statusCode = 410;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", "noindex");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return {
        props: { course: null, isEnrolled: false, totalLessons: 0, totalDuration: 0 },
      };
    }

    // Check if user is enrolled
    let isEnrolled = false;
    const  session = await getSession({ req });
    
    if (session?.user) {
      const enrollment = await (prisma as any).enrollment.findFirst({
        where: {
          courseId: course.id,
          OR: [
            { userId: (session.user as any).id },
            { userEmail: session.user.email },
          ],
          status: 'paid',
        },
      });
      
      isEnrolled = !!enrollment;
    }

    // Calculate totals
    let totalLessons = 0;
    let totalDuration = 0;
    course.modules.forEach((module: any) => {
      totalLessons += module.lessons.length;
      module.lessons.forEach((lesson: any) => {
        totalDuration += lesson.duration || 0;
      });
    });

    return {
      props: {
        course: JSON.parse(JSON.stringify(course)),
        isEnrolled,
        totalLessons,
        totalDuration,
      },
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return { notFound: true };
  }
};

export default CourseDetailPage;
