import React, { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { stripForMeta } from "@/lib/seo";

interface SeoEditorProps {
  title: string;
  description: string; // The article content or snippet
  articleSlug?: string;
  initialMetaTitle?: string | null;
  initialMetaDescription?: string | null;
  initialFocusKeyword?: string | null;
  initialTags?: string | null;
  initialImageAltText?: string | null;
  initialImageCaption?: string | null;
  onUpdate: (data: { metaTitle: string; metaDescription: string; focusKeyword: string; tags: string; imageAltText: string; imageCaption: string }) => void;
}

const SeoEditor: React.FC<SeoEditorProps> = ({
  title: draftTitle,
  description: draftContent,
  articleSlug,
  initialMetaTitle,
  initialMetaDescription,
  initialFocusKeyword,
  initialTags,
  initialImageAltText,
  initialImageCaption,
  onUpdate,
}) => {
  const [metaTitle, setMetaTitle] = useState(initialMetaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    stripForMeta(initialMetaDescription || "", 160)
  );
  const [focusKeyword, setFocusKeyword] = useState(initialFocusKeyword || "");
  const [tags, setTags] = useState(initialTags || "");
  const [imageAltText, setImageAltText] = useState(initialImageAltText || "");
  const [imageCaption, setImageCaption] = useState(initialImageCaption || "");
  const [score, setScore] = useState(0);

  // Initialize with draft content if empty
  useEffect(() => {
    // UPDATED: Don't truncate title initially so we don't lose the keyword if it's at the end
    if (!metaTitle && draftTitle) setMetaTitle(draftTitle);
    
    if (!metaDescription && draftContent) {
      setMetaDescription(stripForMeta(draftContent, 160));
    }
  }, [draftTitle, draftContent]);

  // Update parent and calculate score
  useEffect(() => {
    calculateScore();
    onUpdate({ metaTitle, metaDescription, focusKeyword, tags, imageAltText, imageCaption });
  }, [metaTitle, metaDescription, focusKeyword, tags, imageAltText, imageCaption]);

  const calculateScore = () => {
    let newScore = 0;
    if (!focusKeyword) {
      setScore(0);
      return;
    }
    const keyword = focusKeyword.toLowerCase().trim();
    if (!keyword) return;

    // 1. Keyword in Title
    if (metaTitle.toLowerCase().includes(keyword)) newScore += 20;
    
    // 2. Keyword in Description
    if (metaDescription.toLowerCase().includes(keyword)) newScore += 20;
    
    // 3. Keyword in URL (simulated) - handle spaces as hyphens
    const slugKeyword = keyword.replace(/\s+/g, '-');
    if (articleSlug?.toLowerCase().includes(slugKeyword)) newScore += 10;
    
    // 4. Title length (40-60 good)
    if (metaTitle.length >= 20 && metaTitle.length <= 70) newScore += 15; // Relaxed range slightly
    else if (metaTitle.length > 0) newScore += 5;
    
    // 5. Description length (120-160 good)
    if (metaDescription.length >= 100 && metaDescription.length <= 165) newScore += 15; // Relaxed range
    else if (metaDescription.length > 0) newScore += 5;
    
    // 6. Keyword at the beginning of title
    if (metaTitle.toLowerCase().startsWith(keyword)) newScore += 10;
    
     // 7. Content length is substantial (proxy check)
    if (draftContent.length > 300) newScore += 10;

    setScore(Math.min(100, newScore));
  };

  const Checks = () => {
     if (!focusKeyword) return null;
     const k = focusKeyword.toLowerCase().trim();
     return (
        <div className="space-y-2 mt-4 text-sm">
             <CheckItem label="Keyword in SEO Title" valid={metaTitle.toLowerCase().includes(k)} />
             <CheckItem label="Keyword in Meta Description" valid={metaDescription.toLowerCase().includes(k)} />
             <CheckItem label="Title has good length (20-70 chars)" valid={metaTitle.length >= 20 && metaTitle.length <= 70} />
             <CheckItem label="Description has good length (100-165 chars)" valid={metaDescription.length >= 100 && metaDescription.length <= 165} />
             <CheckItem label="Keyword at start of Title" valid={metaTitle.toLowerCase().startsWith(k)} />
        </div>
     )
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           🚀 SEO Optimization
        </h3>
        <div className={`text-2xl font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {score}/100
        </div>
      </div>

      {/* Snippet Preview */}
      <div className="bg-white p-4 rounded mb-6 font-sans">
         <p className="text-sm text-gray-500 mb-1">dalimss.news › articles › {articleSlug || "your-article-url"}</p>
         <h4 className="text-xl text-blue-800 cursor-pointer hover:underline truncate">{metaTitle || "SEO Title Preview"}</h4>
         <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {metaDescription || "This is how your description will appear in search results. Make it catchy!"}
         </p>
      </div>

      <div className="space-y-4">
         <div>
            <label className="block text-gray-400 text-sm mb-1">Focus Keyword</label>
            <input 
               type="text" 
               className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
               placeholder="e.g. Varanasi News"
               value={focusKeyword}
               onChange={(e) => setFocusKeyword(e.target.value)}
            />
         </div>

         <div>
            <label className="block text-gray-400 text-sm mb-1 flex justify-between">
                <span>SEO Title</span>
                <span className={metaTitle.length > 60 ? "text-red-400" : "text-gray-400"}>{metaTitle.length}/60</span>
            </label>
            <input 
               type="text" 
               className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
               value={metaTitle}
               onChange={(e) => setMetaTitle(e.target.value)}
            />
             <div className="w-full bg-gray-700 h-1 mt-1 rounded">
                <div 
                    className={`h-1 rounded ${metaTitle.length > 60 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{width: `${Math.min(100, (metaTitle.length/60)*100)}%`}}
                />
            </div>
         </div>

         <div>
            <label className="block text-gray-400 text-sm mb-1 flex justify-between">
                <span>Meta Description</span>
                <span className={metaDescription.length > 160 ? "text-red-400" : "text-gray-400"}>{metaDescription.length}/160</span>
            </label>
            <textarea 
               className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white h-24"
               value={metaDescription}
               onChange={(e) => setMetaDescription(stripForMeta(e.target.value, 160))}
            />
             <div className="w-full bg-gray-700 h-1 mt-1 rounded">
                <div 
                    className={`h-1 rounded ${metaDescription.length > 160 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{width: `${Math.min(100, (metaDescription.length/160)*100)}%`}}
                />
            </div>
         </div>

         <div>
            <label className="block text-gray-400 text-sm mb-1">Tags (comma separated)</label>
            <input 
               type="text" 
               className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
               placeholder="e.g. politics, varanasi, election, deal"
               value={tags}
               onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add the tag deal for a price or sale report, including a brand sale with no retailer.
            </p>
         </div>

         <div>
            <label className="block text-gray-400 text-sm mb-1">Image Alt Text (Accessibility & SEO)</label>
            <input 
               type="text" 
               className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
               placeholder="Describe the main article image"
               value={imageAltText}
               onChange={(e) => setImageAltText(e.target.value)}
            />
         </div>

         <div>
            <label className="block text-gray-400 text-sm mb-1">Lead Image Caption</label>
            <textarea
               className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white h-20"
               placeholder="Describe what the image shows. For AI-generated images start with: AI-generated illustration:"
               value={imageCaption}
               onChange={(e) => setImageCaption(stripForMeta(e.target.value, 240))}
            />
            <p className="text-xs text-gray-500 mt-1">
              AI-generated images must be labelled.
            </p>
         </div>
      </div>

      <Checks />

    </div>
  );
};

const CheckItem = ({ label, valid }: { label: string, valid: boolean }) => (
    <div className="flex items-center gap-2">
        {valid ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
        <span className={valid ? "text-green-400" : "text-red-400"}>{label}</span>
    </div>
)

export default SeoEditor;
