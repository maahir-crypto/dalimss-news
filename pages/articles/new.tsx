
import React, { useState } from "react";
import dynamic from "next/dynamic";
import SeoEditor from "@/components/SeoEditor";
import { CATEGORIES } from "@/lib/categories";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { compressImage } from "@/utils/compressImage";
import {
  editorTextToSources,
  normalizeArticleSources,
} from "@/lib/articleSources";
import { uploadArticleMedia } from "@/lib/articleMediaUpload";

interface MediaEntry {
  file: File;
  preview: string;
  type: "image" | "video";
}

const NewArticle: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaEntry[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["India"]);
  const [customAuthor, setCustomAuthor] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceLinks, setSourceLinks] = useState("");
  const [reportingBasis, setReportingBasis] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const [seoData, setSeoData] = useState({ metaTitle: "", metaDescription: "", focusKeyword: "", tags: "", imageAltText: "", imageCaption: "" });
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);

  if (status === "loading") {
    return <p className="text-center mt-10 text-white">Loading...</p>;
  }

  if (!session) {
    return (
      <div className="text-center text-white mt-20">
        <p>You must be logged in to write an article.</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 px-6 py-2 rounded mt-4"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!title || title.trim().length < 3) {
      alert("Please enter a title BEFORE uploading media.");
      e.target.value = "";
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    const newEntries: MediaEntry[] = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const isImage = file.type.startsWith("image");
      const isVideo = file.type.startsWith("video");

      if (!isImage && !isVideo) continue;

      // Auto-compress large images
      if (isImage && file.size > 500 * 1024) {
        try {
          file = await compressImage(file);
        } catch (err) {
          console.error("Compression failed, using original:", err);
        }
      }

      newEntries.push({
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }

    setMediaFiles((prev) => [...prev, ...newEntries]);
    setCompressing(false);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Editor Checklist Validation: Cannot publish without title, description, category, image, author, and summary/content
    if (!title.trim() || title.trim().length < 3) {
      alert("Please provide a valid article title (at least 3 characters).");
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      alert("Please provide a valid article content/summary.");
      return;
    }
    if (!customAuthor.trim()) {
      alert("Please provide the author name.");
      return;
    }
    if (reportingBasis.trim().length < 30) {
      alert(
        "Please describe the specific reporting basis (at least 30 characters). Name the document, interview, location, data, or response used."
      );
      return;
    }
    if (mediaFiles.length === 0) {
      alert("Please upload at least one image or video for the article.");
      return;
    }
    if (seoData.metaDescription.trim().length < 50) {
      alert("Please provide a plain-language editorial summary of at least 50 characters.");
      return;
    }
    if (
      mediaFiles[0]?.type === "image" &&
      !seoData.imageAltText.trim()
    ) {
      alert("Please provide descriptive alt text for the lead image.");
      return;
    }
    const sourceLineCount = sourceLinks
      .split("\n")
      .filter((line) => line.trim()).length;
    const parsedSources = editorTextToSources(sourceLinks);
    if (
      sourceLineCount > 0 &&
      (parsedSources.length !== sourceLineCount ||
        normalizeArticleSources(parsedSources).length !== parsedSources.length)
    ) {
      alert(
        "Each additional source must use: descriptive label | complete HTTP(S) URL."
      );
      return;
    }
    if (
      mediaFiles[0]?.type === "image" &&
      !seoData.imageCaption.trim()
    ) {
      alert("Please provide a factual caption for the lead image.");
      return;
    }

    setLoading(true);

    try {
      // Upload all media files
      const uploadedItems: { url: string; type: "image" | "video" }[] = [];

      if (mediaFiles.length > 0) {
        setUploadingMedia(true);
        for (let index = 0; index < mediaFiles.length; index++) {
          const entry = mediaFiles[index];
          const url = await uploadArticleMedia(
            entry.file,
            entry.type,
            (percentage) =>
              setUploadProgress(
                Math.round(((index + percentage / 100) / mediaFiles.length) * 100)
              )
          );
          uploadedItems.push({ url, type: entry.type });
        }
        setUploadingMedia(false);
        setUploadProgress(100);
      }

      // Primary media for backward compatibility
      const primaryMedia = uploadedItems[0] || null;

      // Create article
      const resp = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          mediaUrl: primaryMedia?.url || null,
          mediaType: primaryMedia?.type || null,
          mediaItems: uploadedItems.length > 0 ? uploadedItems : undefined,
          category: selectedCategories.join(", "),
          customAuthor,
          sourceUrl,
          sourceUrls: parsedSources,
          reportingBasis,
          language,
          slug,
          ...seoData,
        }),
      });

      const respText = await resp.text();
      let articleData;
      try { articleData = JSON.parse(respText); } catch {
        if (resp.status === 413) throw new Error("Article content is too large. Please shorten the content or remove embedded media.");
        throw new Error(`Server error (${resp.status}): ${respText.slice(0, 100)}`);
      }

      if (!resp.ok) {
        const summary = [articleData.error || "Failed to publish article"];
        if (articleData.code) summary.push(String(articleData.code));
        if (articleData.detail) summary.push(String(articleData.detail));
        throw new Error(summary.join(" — "));
      }

      router.push(`/articles/${articleData.slug}`);
    } catch (err: any) {
      console.error("❌ Publish error:", err);
      alert(err.message || "Error while publishing article.");
    } finally {
      setLoading(false);
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-900">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">Create New Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Title..."
          className="w-full p-3 rounded bg-white border border-gray-300 text-gray-900 font-bold text-xl"
          value={title}
          onChange={(e) => {
             setTitle(e.target.value);
             if (!slugEdited) {
               setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
             }
          }}
          required
        />

        <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex-1">
             <label className="block text-sm text-gray-600 mb-1">URL Slug</label>
             <input
               type="text"
               placeholder="custom-url-slug"
               className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
               value={slug}
               onChange={(e) => {
                 setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                 setSlugEdited(true);
               }}
               required
             />
           </div>
           <div className="flex-1">
             <label className="block text-sm text-gray-600 mb-1">Primary Source URL (Optional)</label>
             <input
               type="url"
               placeholder="Official order, statement, notice or document URL"
               className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
               value={sourceUrl}
               onChange={(e) => setSourceUrl(e.target.value)}
             />
             <p className="mt-1 text-xs text-gray-500">
               Add government notices, court records, police statements, press
               releases or other primary material when available.
             </p>
           </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Additional source links (Optional)
          </label>
          <textarea
            className="w-full min-h-28 p-3 rounded bg-white border border-gray-300 text-gray-900"
            value={sourceLinks}
            onChange={(e) => setSourceLinks(e.target.value)}
            placeholder={"Official resignation statement | https://example.gov/statement\nNTA examination notification | https://example.gov/notification"}
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter one source per line as: descriptive label | complete URL.
            Link original documents, briefings, notifications and named
            statements rather than search results.
          </p>
        </div>
        
        <input
          type="text"
          placeholder="Author Name"
          className="w-full p-3 rounded bg-white border border-gray-300 text-gray-900"
          value={customAuthor}
          onChange={(e) => setCustomAuthor(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Reporting basis
          </label>
          <textarea
            className="w-full min-h-28 p-3 rounded bg-white border border-gray-300 text-gray-900"
            value={reportingBasis}
            onChange={(e) => setReportingBasis(e.target.value)}
            placeholder="Example: Based on the Varanasi Police statement issued at 7:30 AM on 31 July 2026 and an interview with [name, designation]. Dalimss News contacted [office] at [time]; a response was awaited at publication."
            minLength={30}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Name official documents, people interviewed, reporting locations,
            contact attempts, data, and publication times where relevant. Do
            not use generic newsroom-review wording.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Article language
          </label>
          <select
            className="w-full p-3 rounded bg-white border border-gray-300 text-gray-900"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
            required
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Hindi articles are listed on the Hindi section and stay off the
            English homepage, article index, category pages, and English feeds.
          </p>
        </div>
        
        {/* Category Multi-Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Categories (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedCategories.length > 1) {
                        setSelectedCategories(selectedCategories.filter((c) => c !== cat.name));
                      } else {
                        alert("An article must belong to at least one category.");
                      }
                    } else {
                      setSelectedCategories([...selectedCategories, cat.name]);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? "bg-red-600 border-red-600 text-white shadow-sm scale-105"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your article content here..."
          />
          <p className="text-sm text-gray-400 mt-2">
            💡 <strong>Tip:</strong> Use the toolbar above to format headings, bold, italic, lists, links, and more.
          </p>
        </div>

        {/* Media Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Media ({mediaFiles.length} {mediaFiles.length === 1 ? "file" : "files"})
            </h3>
            <label className="flex items-center justify-center px-5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer transition-all">
              <span className="text-sm font-semibold text-blue-600">
                + Add Photos / Videos
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaSelect}
              />
            </label>
          </div>

          {compressing && (
            <p className="text-sm text-yellow-600 animate-pulse">
              🗜️ Compressing images...
            </p>
          )}

          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mediaFiles.map((entry, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
                  {entry.type === "image" ? (
                    <img src={entry.preview} className="w-full h-40 object-cover" alt={`media-${index}`} />
                  ) : (
                    <video src={entry.preview} className="w-full h-40 object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Remove"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                    {entry.type === "video" ? "🎬 Video" : "📷 Image"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mediaFiles.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
              <p className="text-lg mb-1">No media attached</p>
              <p className="text-sm">Select media here; it uploads when you publish</p>
            </div>
          )}
        </div>

        <SeoEditor 
            title={title} 
            description={content}
            onUpdate={setSeoData}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-6 py-2 rounded text-white mt-4 disabled:opacity-50"
        >
          {loading
            ? uploadingMedia
              ? `Uploading media... ${uploadProgress}%`
              : "Publishing..."
            : "Publish"}
        </button>
      </form>
    </div>
  );
};

export const getServerSideProps = async (context: any) => {
  const { getSession } = await import("next-auth/react");
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  
  // Admin Check
  const isAdmin = session.user?.role === "admin" || session.user?.role === "editor" || session.user?.email === "admin@dalimss.com" || session.user?.email === "sushantgaurav@dalimss.com" || session.user?.email === "dalimsssushant@gmail.com";

  if (!isAdmin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default NewArticle;
