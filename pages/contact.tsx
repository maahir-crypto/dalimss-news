import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  EnvelopeIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import {
  ORGANIZATION_ADDRESS,
  ORGANIZATION_ID,
  ORGANIZATION_LANGUAGES,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const contactCards = [
  {
    icon: EnvelopeIcon,
    title: "General Enquiries & App Support",
    description: "Contact the Dalimss News team for help with our app",
    value: "info@dalimss.news",
    href: "mailto:info@dalimss.news",
    action: "Send Email",
  },
  {
    icon: EnvelopeIcon,
    title: "Editorial & Corrections",
    description: "News tips, editorial feedback and corrections",
    value: "editor@dalimss.news",
    href: "mailto:editor@dalimss.news",
    action: "Send Email",
  },
  {
    icon: PhoneIcon,
    title: "Call Us",
    description: "Mon–Sat, 9:00 AM – 6:00 PM IST",
    value: "+91 9309123123",
    href: "tel:+919309123123",
    action: "Call Now",
  },
];

const faqItems = [
  {
    question: "How can I submit a news tip?",
    answer:
      "You can send us news tips via email at editor@dalimss.news or use the contact form below. Please include as many details as possible, including photos or videos if available.",
  },
  {
    question: "How can I advertise on Dalimss News?",
    answer:
      "For advertising inquiries, please email us at editor@dalimss.news with the subject line 'Advertising Inquiry'. We offer banner ads, sponsored articles, and social media promotions.",
  },
  {
    question: "How do I report incorrect information?",
    answer:
      "We take accuracy very seriously. If you find any incorrect information in our articles, please email us with the article link and the correction details. We will review and update promptly.",
  },
  {
    question: "Can I write for Dalimss News?",
    answer:
      "Yes! We welcome contributions from guest writers. Please send your article pitch or draft to editor@dalimss.news. Our editorial team will review it and get back to you.",
  },
];

const ContactPage: React.FC = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    email: "editor@dalimss.news",
    address: ORGANIZATION_ADDRESS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: "editor@dalimss.news",
      telephone: "+91-6392752976",
      availableLanguage: ORGANIZATION_LANGUAGES,
    },
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Send via mailto as a fallback (no backend needed)
    const mailtoLink = `mailto:editor@dalimss.news?subject=${encodeURIComponent(
      formData.subject || "Contact Form Submission"
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;

    window.open(mailtoLink, "_blank");
    setStatus("sent");
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <>
      <Head>
        <title>Contact Us | Dalimss News</title>
        <meta
          name="description"
          content="Contact Dalimss News - Get in touch with us for news tips, feedback, advertising inquiries, or corrections. We're here to help!"
        />
        <meta property="og:title" content="Contact Us | Dalimss News" />
        <meta
          property="og:description"
          content="Contact Dalimss News - Get in touch with us for news tips, feedback, and inquiries."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-red-300">
                Get In Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Contact <span className="text-red-500">Dalimss News</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Have a story tip, feedback, or question? We'd love to hear from
              you. We aim to review newsroom messages within 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <a
                  key={index}
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    card.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-red-600 transition-colors duration-300">
                    <Icon className="h-8 w-8 text-red-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {card.description}
                  </p>
                  <p className="text-gray-700 font-medium mb-4">{card.value}</p>
                  <span className="inline-flex items-center text-sm font-semibold text-red-600 group-hover:text-red-700">
                    {card.action} →
                  </span>
                </a>
              );
            })}
          </div>
          <p className="max-w-5xl mx-auto mt-8 text-center text-gray-700">
            Newsroom: Gurugram, Haryana (headquarters). Bureau: Varanasi, Uttar Pradesh.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 bg-white"
                    >
                      <option value="">Select a topic...</option>
                      <option value="News Tip">📰 News Tip</option>
                      <option value="Feedback">💬 Feedback</option>
                      <option value="Correction">✏️ Report a Correction</option>
                      <option value="Advertising">📢 Advertising Inquiry</option>
                      <option value="Partnership">🤝 Partnership</option>
                      <option value="Guest Article">📝 Guest Article Submission</option>
                      <option value="Other">📋 Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-red-600/30"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    {status === "sending"
                      ? "Opening email..."
                      : status === "sent"
                      ? "✅ Email client opened!"
                      : "Send Message"}
                  </button>

                  {status === "sent" && (
                    <p className="text-green-600 text-sm mt-2">
                      Your email client has been opened. Please send the email
                      to complete your message.
                    </p>
                  )}
                </form>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Response Time</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We aim to review newsroom messages within{" "}
                    <strong>48 hours</strong> during working hours (Mon–Sat, 9
                    AM – 6 PM IST).
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <NewspaperIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">News Tips</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Have a breaking news tip? Send it to us immediately via
                    email or phone. Include photos/videos when possible.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/dalimss.news.banaras/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-pink-50 hover:text-pink-600 text-gray-600 transition-all"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a
                      href="https://www.youtube.com/@dalimss_news"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-600 transition-all"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-200 transition-colors"
                >
                  <summary className="cursor-pointer px-6 py-5 text-lg font-semibold text-gray-900 list-none flex items-center justify-between">
                    {item.question}
                    <span className="text-red-500 group-open:rotate-45 transition-transform duration-200 text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated with Dalimss News
          </h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Follow us on social media and never miss an important story from
            Varanasi and beyond.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all"
          >
            <NewspaperIcon className="h-5 w-5" />
            Read Latest News
          </Link>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
