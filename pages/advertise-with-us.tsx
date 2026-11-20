import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { 
  BuildingOffice2Icon, 
  UserGroupIcon, 
  MegaphoneIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon,
  VideoCameraIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function AdvertiseWithUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    format: "Display Banner Ads",
    budget: "< ₹50,000",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  const adFormats = [
    {
      icon: MegaphoneIcon,
      title: "Display Banner Ads",
      tag: "High Visibility",
      description: "Premium placement options including Header Leaderboards, Sidebar MPUs, Sticky Footers, and In-Article Native Banners across high-traffic pages.",
      specs: "Leaderboard (728x90), MPU (300x250), Mobile Sticky (320x50)"
    },
    {
      icon: DocumentCheckIcon,
      title: "Sponsored Content & Advertorials",
      tag: "High Engagement",
      description: "Clearly labelled sponsored articles, product launch showcases, and brand stories subject to editorial and advertising review. Search indexing is never guaranteed.",
      specs: "Custom scope, High-Res Media, rel=sponsored Links"
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Web Stories & Vertical Video",
      tag: "Mobile First",
      description: "Full-screen mobile web stories with tap-through CTAs, perfect for reaching Gen-Z and mobile-first news readers with immersive visuals.",
      specs: "9:16 Vertical Video / Cards, Direct Swipe-Up Links"
    },
    {
      icon: VideoCameraIcon,
      title: "Video Integration & Pre-Roll",
      tag: "High Impact",
      description: "Pre-roll video ads, sponsored video news segments, and custom branded video coverage integrated directly into popular news stories.",
      specs: "15s / 30s Non-Skip Video Ads, High Completion Rate"
    }
  ];

  const stats = [
    { label: "Coverage Focus", value: "Varanasi" },
    { label: "Regional Focus", value: "Purvanchal" },
    { label: "Campaign Metrics", value: "On Request" },
    { label: "Ad Disclosure", value: "Clearly Labelled" },
  ];

  const faqs = [
    {
      q: "How fast can an advertising campaign go live?",
      a: "Display banner campaigns can go live within 24 hours of creative approval. Sponsored articles and custom video integrations typically require 2-3 business days for editorial review and publishing."
    },
    {
      q: "How do you handle editorial independence?",
      a: "All sponsored content and advertorials are clearly labeled with a 'Sponsored' or 'Brand Partnership' badge in strict compliance with ASCI and Indian digital media regulations. Our advertising team operates separately from our newsroom."
    },
    {
      q: "Can I target specific geographical regions like UP or Gurugram?",
      a: "Yes! We support geo-targeted ad serving, allowing you to run localized campaigns specifically in Varanasi, Eastern UP (Purvanchal), NCR/Gurugram, or nationwide across India."
    },
    {
      q: "Do you offer campaign performance reporting?",
      a: "Absolutely. All advertisers receive detailed performance reports post-campaign including impressions, click-through rates (CTR), geographic breakdown, and engagement metrics."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col justify-between">
      <Head>
        <title>Advertise With Us | Media Kit & Advertising Solutions — Dalimss News</title>
        <meta
          name="description"
          content="Advertise with Dalimss News. Reach millions of engaged readers across Varanasi, Uttar Pradesh, Gurugram, and India through display ads, sponsored content, and web stories."
        />
        <meta
          name="keywords"
          content="Advertise Dalimss News, digital news advertising, Varanasi ads, UP news advertising, Gurugram news ads, sponsored content India, news website banner ads"
        />
        <link rel="canonical" href="https://dalimss.news/advertise-with-us" />
      </Head>

      <div>
        <Nav />

        {/* HERO BANNER SECTION */}
        <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-widest mb-6">
                <SparklesIcon className="w-4 h-4 text-red-400" /> Premium Media & Ad Solutions
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight leading-tight mb-6">
                Amplify Your Brand with <span className="text-red-500">Dalimss News</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                Connect with hyper-engaged, educated audiences across <strong className="text-white font-semibold">Varanasi, Uttar Pradesh, Gurugram</strong>, and nationwide digital readers.
              </p>

              {/* STATS STRIP */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-3xl mx-auto">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-2">
                    <p className="text-2xl sm:text-3xl font-extrabold text-red-400 font-serif">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-medium tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTAINER */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={[{ name: "Advertise With Us", href: "/advertise-with-us" }]} />

          {/* WHY ADVERTISE WITH US */}
          <section className="mt-8 mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Why Partner With Us?</h2>
              <p className="text-gray-600 mt-2">
                We offer clearly disclosed advertising placements alongside
                our regional coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <BuildingOffice2Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif">Regional Context</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Campaigns can be placed alongside coverage focused on
                  Varanasi and Purvanchal. Placement does not imply editorial
                  endorsement.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif">High-Intent Audience</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Campaigns can align with relevant sections such as education,
                  local infrastructure, culture and business. Performance
                  varies and is reported from measured campaign data.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif">Strict Editorial Integrity</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sponsored material is labelled, advertising links use
                  appropriate attributes, and advertisers do not control
                  independent newsroom decisions.
                </p>
              </div>
            </div>
          </section>

          {/* ADVERTISING FORMATS */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Flexible Ad Formats</h2>
              <p className="text-gray-600 mt-2">
                Tailored campaign packages designed for maximum viewability and engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adFormats.map((format, idx) => {
                const IconComponent = format.icon;
                return (
                  <div key={idx} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm hover:border-red-300 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold font-serif text-gray-900">{format.title}</h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {format.tag}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {format.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <ChartBarIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span><strong>Specs:</strong> {format.specs}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CONTACT & MEDIA KIT REQUEST FORM */}
          <section id="contact-sales" className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Form Side */}
              <div className="lg:col-span-7 p-8 sm:p-10">
                <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">Request Media Kit & Quote</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Fill in your campaign details. We aim to review advertising
                  enquiries within two business days.
                </p>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl flex items-start gap-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-lg">Thank You for Reaching Out!</h4>
                      <p className="text-sm mt-1 text-green-700">
                        We have received your advertising inquiry. Our sales specialist will email you the official Dalimss News Media Kit & rate card shortly.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="mt-4 text-xs font-semibold text-green-800 underline hover:text-green-900"
                      >
                        Submit another inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="rahul@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Company / Brand
                        </label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Preferred Ad Format
                        </label>
                        <select
                          value={formData.format}
                          onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white transition"
                        >
                          <option value="Display Banner Ads">Display Banner Ads</option>
                          <option value="Sponsored Article / Advertorial">Sponsored Content / Advertorial</option>
                          <option value="Web Stories & Mobile">Web Stories & Mobile</option>
                          <option value="Video Integration">Video Integration & Pre-Roll</option>
                          <option value="Custom Brand Campaign">Custom Brand Campaign</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Estimated Budget
                        </label>
                        <select
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white transition"
                        >
                          <option value="< ₹50,000">Under ₹50,000</option>
                          <option value="₹50,000 - ₹1.5 Lakhs">₹50,000 - ₹1.5 Lakhs</option>
                          <option value="₹1.5 Lakhs - ₹5 Lakhs">₹1.5 Lakhs - ₹5 Lakhs</option>
                          <option value="> ₹5 Lakhs">₹5 Lakhs+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Campaign Details / Goals
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your target region, campaign dates, and objectives..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Submit & Request Rate Card</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              {/* Direct Info Side */}
              <div className="lg:col-span-5 bg-gray-900 text-white p-8 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-800">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white mb-4">Direct Sales Contact</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Prefer direct communication? Reach our dedicated media planning desk.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-white/10 rounded-lg text-red-400">
                        <EnvelopeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Inquiry</p>
                        <a href="mailto:sales@dalimss.news" className="text-sm font-medium text-white hover:text-red-400 transition-colors">
                          sales@dalimss.news
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-white/10 rounded-lg text-red-400">
                        <PhoneIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone / WhatsApp</p>
                        <p className="text-sm font-medium text-white">
                          +91 94152 23344
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-white/10 rounded-lg text-red-400">
                        <MapPinIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Headquarters</p>
                        <p className="text-sm font-medium text-gray-300">
                          Gurugram, Haryana and Varanasi, Uttar Pradesh, India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-800 text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-300 block mb-1">Editorial Independence Policy:</strong>
                  Our advertising and sponsored content operations strictly run independent of the core news reporting team to preserve editorial trust and objectivity.
                </div>
              </div>
            </div>
          </section>

          {/* FREQUENTLY ASKED QUESTIONS */}
          <section className="mb-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 flex items-center justify-center gap-2">
                <QuestionMarkCircleIcon className="w-7 h-7 text-red-600" />
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left font-semibold text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-base">{faq.q}</span>
                      <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180 text-red-600" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
