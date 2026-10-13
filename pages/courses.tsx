import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { coursePath } from "@/lib/publicPaths";
import { useSession } from "next-auth/react";
import { 
  AcademicCapIcon, 
  ClockIcon, 
  UserGroupIcon, 
  PlayCircleIcon,
  CheckBadgeIcon,
  StarIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Course data - TODO: Fetch from database
const courses = [
  {
    id: 1,
    slug: "digital-journalism-fundamentals",
    title: "Digital Journalism Fundamentals",
    description: "Learn the basics of modern digital journalism, from writing compelling stories to understanding multimedia storytelling techniques.",
    duration: "6 weeks",
    students: "1,200+",
    level: "Beginner",
    image: "/courses/journalism.jpg",
    price: "₹4,999",
    priceNumber: 4999,
    rating: 4.8,
    highlights: ["News Writing", "Research Skills", "Interview Techniques", "Ethics in Journalism"]
  },
  {
    id: 2,
    slug: "video-production-editing",
    title: "Video Production & Editing",
    description: "Master video production from concept to final cut. Learn professional editing techniques using industry-standard tools.",
    duration: "8 weeks",
    students: "850+",
    level: "Intermediate",
    image: "/courses/video.jpg",
    price: "₹6,999",
    priceNumber: 6999,
    rating: 4.9,
    highlights: ["Camera Techniques", "Adobe Premiere Pro", "Sound Design", "Color Grading"]
  },
  {
    id: 3,
    slug: "social-media-management",
    title: "Social Media Management",
    description: "Build and grow your brand on social platforms. Learn content strategy, analytics, and engagement tactics.",
    duration: "4 weeks",
    students: "2,100+",
    level: "Beginner",
    image: "/courses/social.jpg",
    price: "₹3,499",
    priceNumber: 3499,
    rating: 4.7,
    highlights: ["Content Strategy", "Analytics", "Community Building", "Paid Advertising"]
  },
  {
    id: 4,
    slug: "investigative-reporting",
    title: "Investigative Reporting",
    description: "Deep dive into investigative journalism. Learn research methodologies, source protection, and impactful storytelling.",
    duration: "10 weeks",
    students: "450+",
    level: "Advanced",
    image: "/courses/investigative.jpg",
    price: "₹8,999",
    priceNumber: 8999,
    rating: 4.9,
    highlights: ["Data Analysis", "FOIA Requests", "Source Protection", "Long-form Writing"]
  },
  {
    id: 5,
    slug: "photography-for-journalists",
    title: "Photography for Journalists",
    description: "Capture compelling images that tell stories. Learn composition, lighting, and photojournalism ethics.",
    duration: "5 weeks",
    students: "980+",
    level: "Beginner",
    image: "/courses/photography.jpg",
    price: "₹4,499",
    priceNumber: 4499,
    rating: 4.6,
    highlights: ["Composition", "Street Photography", "Photo Editing", "Documentary Style"]
  },
  {
    id: 6,
    slug: "podcast-production",
    title: "Podcast Production",
    description: "Create professional podcasts from scratch. Learn recording, editing, and distribution strategies.",
    duration: "6 weeks",
    students: "720+",
    level: "Intermediate",
    image: "/courses/podcast.jpg",
    price: "₹5,499",
    priceNumber: 5499,
    rating: 4.8,
    highlights: ["Audio Recording", "Podcast Editing", "Distribution", "Monetization"]
  }
];

const CoursesPage: React.FC = () => {
  const { data: session } = useSession();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setShowPaymentModal(true);
    
    // Pre-fill form with session data if available
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
      // Create order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
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

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dalimss Academy",
        description: selectedCourse.title,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
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
              alert("Payment successful! You are now enrolled in the course.");
              setShowPaymentModal(false);
              setSelectedCourse(null);
              setFormData({ name: "", email: "", phone: "" });
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
        <title>Courses | Dalimss News</title>
        <meta name="description" content="Explore professional journalism and media courses offered by Dalimss News. Learn from industry experts and advance your career." />
        <meta property="og:title" content="Courses | Dalimss News" />
        <meta property="og:description" content="Explore professional journalism and media courses offered by Dalimss News." />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </Head>


        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white py-16 md:py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                <AcademicCapIcon className="h-5 w-5 text-red-400" />
                <span className="text-sm font-medium text-red-300">Dalimss Academy</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Learn from <span className="text-red-500">Industry Experts</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Advance your career in journalism and media with our professionally designed courses. 
                Practical skills, expert guidance, and real-world projects.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#courses" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-red-600/30">
                  Browse Courses
                </a>
                <Link href="/about" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold border border-white/20 transition-all">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">6,000+</div>
                <div className="text-sm text-gray-500 mt-1">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-500 mt-1">Expert Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-500 mt-1">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-500 mt-1">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section id="courses" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our carefully curated selection of courses designed to help you excel in the media industry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  {/* Course Image Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircleIcon className="h-16 w-16 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <StarIcon className="h-4 w-4 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">{course.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{course.students} students</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {course.price}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={coursePath(course.slug)}
                      className="block w-full mt-4 bg-gray-900 hover:bg-red-600 text-center text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Dalimss Academy?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide industry-leading education with practical experience and career support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
                <p className="text-gray-600">Course pages identify the instructor and the practical experience relevant to each programme.</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckBadgeIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certified Courses</h3>
                <p className="text-gray-600">Receive industry-recognized certifications that boost your professional credibility.</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community Support</h3>
                <p className="text-gray-600">Join a thriving community of aspiring journalists and media professionals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have transformed their careers with Dalimss Academy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#courses" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all">
                View All Courses
              </a>
              <Link href="/about" className="bg-red-500 hover:bg-red-400 text-white px-8 py-3 rounded-lg font-semibold border border-red-400 transition-all">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Payment Modal */}
        {showPaymentModal && selectedCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Enroll Now</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedCourse.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedCourse(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Course Fee</span>
                    <span className="text-2xl font-bold text-red-600">{selectedCourse.price}</span>
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

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">What you'll get:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckBadgeIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Lifetime access to course materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckBadgeIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckBadgeIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Community support</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : `Pay ${selectedCourse.price}`}
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    Secure payment powered by Razorpay
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}

    </>
  );
};

export default CoursesPage;
