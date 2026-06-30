"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link as LinkIcon, Unlink, Image as ImageIcon, Video, Quote, Minus, 
  Smile, Undo, Redo, Heading1, Heading2, Heading3, Palette, Highlighter, Upload, Grid
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Custom dialogs state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">("center");
  const [imageWidth, setImageWidth] = useState("100%");
  
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "mp4">("youtube");
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  
  const [mediaLibraryFiles, setMediaLibraryFiles] = useState<any[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // Sync value to editor innerHTML (prevent cursor jumping by only updating when different)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd: string, arg: string = "") => {
    if (typeof document !== "undefined") {
      document.execCommand(cmd, false, arg);
      handleInput();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey) {
      if (e.key === "b") {
        e.preventDefault();
        execCmd("bold");
      } else if (e.key === "i") {
        e.preventDefault();
        execCmd("italic");
      } else if (e.key === "u") {
        e.preventDefault();
        execCmd("underline");
      }
    }
  };

  // Upload image to API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        setShowMediaLibrary(false);
      } else {
        alert("Upload failed.");
      }
    } catch {
      alert("Error uploading file.");
    }
  };

  // Retrieve files from Media Library
  const fetchMediaLibrary = async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaLibraryFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showMediaLibrary) {
      fetchMediaLibrary();
    }
  }, [showMediaLibrary]);

  const insertImageHtml = () => {
    if (!imageUrl) return;

    let alignmentStyle = "";
    if (imageAlign === "left") alignmentStyle = "float: left; margin: 0 15px 15px 0;";
    else if (imageAlign === "right") alignmentStyle = "float: right; margin: 0 0 15px 15px;";
    else alignmentStyle = "display: block; margin: 15px auto;";

    const imgStyle = `max-width: ${imageWidth}; width: 100%; border-radius: 8px; ${alignmentStyle}`;
    
    let html = `<img src="${imageUrl}" alt="${imageCaption || 'Embedded Image'}" style="${imgStyle}" />`;
    if (imageCaption) {
      html = `
        <figure style="text-align: ${imageAlign === 'center' ? 'center' : imageAlign}; margin: 15px 0; display: inline-block; width: 100%;">
          <img src="${imageUrl}" alt="${imageCaption}" style="${imgStyle} margin-bottom: 5px;" />
          <figcaption style="font-size: 11px; color: #666; font-style: italic;">${imageCaption}</figcaption>
        </figure>
      `;
    }
    
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, html);
      handleInput();
    }
    setShowImageModal(false);
    setImageUrl("");
    setImageCaption("");
  };

  const insertVideoHtml = () => {
    if (!videoUrl) return;
    let html = "";
    
    if (videoType === "youtube") {
      let videoId = "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoUrl.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else {
        videoId = videoUrl;
      }
      html = `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 15px 0; border-radius: 8px;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
          </iframe>
        </div>
      `;
    } else if (videoType === "vimeo") {
      let videoId = "";
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      if (match) videoId = match[1];
      else videoId = videoUrl;
      html = `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 15px 0; border-radius: 8px;">
          <iframe 
            src="https://player.vimeo.com/video/${videoId}" 
            frameborder="0" 
            allowfullscreen 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
          </iframe>
        </div>
      `;
    } else {
      // Local MP4 URL
      html = `
        <video controls style="width: 100%; max-width: 800px; margin: 15px auto; display: block; border-radius: 8px;">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, html);
      handleInput();
    }
    setShowVideoModal(false);
    setVideoUrl("");
  };

  const handleLinkSubmit = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (linkUrl) {
        document.execCommand("createLink", false, linkUrl);
      } else {
        document.execCommand("unlink");
      }
      handleInput();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, emoji);
      handleInput();
    }
    setShowEmojiPicker(false);
  };

  const commonEmojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😜", "😎", "🤔", "🤫", "👍", "👋", "👏", "🔥", "🎉", "❤️", "📍", "🛡️", "🚔", "📢"];
  const textColors = ["#000000", "#333333", "#666666", "#999999", "#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#2e3192", "#ed1b24", "#c5a059"];
  const bgColors = ["#ffffff", "#f3f4f6", "#e5e7eb", "#fca5a5", "#fed7aa", "#fde68a", "#a7f3d0", "#a5f3fc", "#bfdbfe", "#e9d5ff", "transparent"];

  return (
    <div className={`flex flex-col border border-stone-200 dark:border-stone-855 rounded-xl overflow-hidden bg-white dark:bg-stone-950 ${className}`}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850">
        
        {/* Undo/Redo */}
        <button type="button" onClick={() => execCmd("undo")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Undo"><Undo className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("redo")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Redo"><Redo className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Headings */}
        <button type="button" onClick={() => execCmd("formatBlock", "H1")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("formatBlock", "H2")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("formatBlock", "H3")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Text styling */}
        <button type="button" onClick={() => execCmd("bold")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300 font-bold" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("italic")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300 italic" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("underline")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300 underline" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("strikeThrough")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300 line-through" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Font size */}
        <select 
          onChange={(e) => execCmd("fontSize", e.target.value)} 
          className="bg-transparent border border-stone-300 dark:border-stone-700 text-[10px] rounded px-1 text-slate-700 dark:text-stone-300 outline-none"
          title="Font Size"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Text color and Background highlight */}
        <div className="relative">
          <button type="button" onClick={() => { setShowColorPicker(!showColorPicker); setShowBgColorPicker(false); }} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300 flex items-center gap-0.5" title="Text Color">
            <Palette className="w-3.5 h-3.5" />
          </button>
          {showColorPicker && (
            <div className="absolute top-7 left-0 z-50 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl grid grid-cols-6 gap-1 w-32">
              {textColors.map(c => (
                <button key={c} type="button" onClick={() => { execCmd("foreColor", c); setShowColorPicker(false); }} className="w-4 h-4 rounded border border-stone-300" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button type="button" onClick={() => { setShowBgColorPicker(!showBgColorPicker); setShowColorPicker(false); }} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300 flex items-center gap-0.5" title="Highlight Color">
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          {showBgColorPicker && (
            <div className="absolute top-7 left-0 z-50 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl grid grid-cols-6 gap-1 w-32">
              {bgColors.map(c => (
                <button key={c} type="button" onClick={() => { execCmd("backColor", c); setShowBgColorPicker(false); }} className="w-4 h-4 rounded border border-stone-300" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Alignment */}
        <button type="button" onClick={() => execCmd("justifyLeft")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("justifyCenter")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("justifyRight")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("justifyFull")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Justify"><AlignJustify className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Lists */}
        <button type="button" onClick={() => execCmd("insertUnorderedList")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Unordered List"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("insertOrderedList")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Links */}
        <button type="button" onClick={() => setShowLinkModal(true)} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Insert Link"><LinkIcon className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("unlink")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Remove Link"><Unlink className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Media (Image & Video) */}
        <button type="button" onClick={() => { setShowImageModal(true); setImageUrl(""); }} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Insert Image"><ImageIcon className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => { setShowVideoModal(true); setVideoUrl(""); }} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Insert Video"><Video className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Block Elements */}
        <button type="button" onClick={() => execCmd("formatBlock", "blockquote")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Quote Block"><Quote className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("insertHorizontalRule")} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Horizontal Line"><Minus className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

        {/* Emoji picker */}
        <div className="relative">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition cursor-pointer text-slate-700 dark:text-stone-300" title="Insert Emoji">
            <Smile className="w-3.5 h-3.5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute top-7 right-0 z-50 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl grid grid-cols-6 gap-1 w-36 max-h-40 overflow-y-auto">
              {commonEmojis.map(e => (
                <button key={e} type="button" onClick={() => insertEmoji(e)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm">{e}</button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Editor Content Area */}
      <style>{`
        .gcp-editor-div:empty:not(:focus):before {
          content: attr(data-placeholder);
          color: #a8a29e;
          pointer-events: none;
          display: block;
        }
      `}</style>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="gcp-editor-div flex-grow p-4 min-h-[200px] outline-none overflow-y-auto text-sm text-slate-800 dark:text-white bg-white dark:bg-stone-955 max-h-[400px] prose dark:prose-invert"
        {...({ "data-placeholder": placeholder } as any)}
      />

      {/* ─── MODALS ─── */}
      
      {/* 1. Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-2xl text-left">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-stone-300 tracking-wider mb-3">Insert Hyperlink</h4>
            <input 
              type="text" 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)} 
              placeholder="https://example.com" 
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg mb-4 text-slate-800 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowLinkModal(false)} className="px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg text-[10px] uppercase font-bold text-slate-700 dark:text-stone-300">Cancel</button>
              <button type="button" onClick={handleLinkSubmit} className="px-3 py-1.5 bg-brand-gold text-stone-950 rounded-lg text-[10px] uppercase font-bold">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-2xl text-left space-y-4">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-stone-300 tracking-wider">Embed Image Banner</h4>
            
            <div className="space-y-3">
              {/* Option toggle */}
              <div className="flex gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
                <button type="button" onClick={() => setShowMediaLibrary(false)} className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold ${!showMediaLibrary ? 'bg-brand-gold text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-slate-600 dark:text-stone-400'}`}>Direct Upload</button>
                <button type="button" onClick={() => { setShowMediaLibrary(true); }} className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold ${showMediaLibrary ? 'bg-brand-gold text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-slate-600 dark:text-stone-400'}`}>Media Library</button>
              </div>

              {!showMediaLibrary ? (
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-stone-400">Upload Image File</label>
                  <input type="file" onChange={handleFileUpload} className="w-full text-xs text-stone-500" accept="image/*" />
                  {imageUrl && <p className="text-[10px] text-emerald-400 font-bold">File uploaded successfully!</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-stone-400">Choose from Media Library</label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-stone-50 dark:bg-stone-955 rounded-lg border border-stone-200 dark:border-stone-850">
                    {mediaLibraryFiles.map((file) => (
                      <button 
                        key={file.url} 
                        type="button" 
                        onClick={() => setImageUrl(file.url)}
                        className={`relative aspect-video rounded overflow-hidden border-2 ${imageUrl === file.url ? 'border-brand-gold' : 'border-transparent'}`}
                      >
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {mediaLibraryFiles.length === 0 && <p className="col-span-4 text-center text-[10px] text-stone-500 py-6">No media files found</p>}
                  </div>
                </div>
              )}

              {/* Common Image settings */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[9px] uppercase font-black text-stone-400">Image Source URL</label>
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/images/photo.jpg" className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg text-slate-800 dark:text-white" />
                </div>
                
                <div>
                  <label className="text-[9px] uppercase font-black text-stone-400">Caption / Alternative Text</label>
                  <input type="text" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} placeholder="Chennai Police officers helping citizens..." className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg text-slate-800 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-black text-stone-400">Alignment</label>
                    <select value={imageAlign} onChange={(e) => setImageAlign(e.target.value as any)} className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg text-slate-800 dark:text-white">
                      <option value="center">Center</option>
                      <option value="left">Left (Float)</option>
                      <option value="right">Right (Float)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-stone-400">Width Size</label>
                    <select value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg text-slate-800 dark:text-white">
                      <option value="100%">Full Width (100%)</option>
                      <option value="75%">Medium-Large (75%)</option>
                      <option value="50%">Half Page (50%)</option>
                      <option value="25%">Small Corner (25%)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowImageModal(false)} className="px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg text-[10px] uppercase font-bold text-slate-700 dark:text-stone-300">Cancel</button>
              <button type="button" onClick={insertImageHtml} className="px-3 py-1.5 bg-brand-gold text-stone-950 rounded-lg text-[10px] uppercase font-bold" disabled={!imageUrl}>Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Insert Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-2xl text-left space-y-4">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-stone-300 tracking-wider">Embed Video Content</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] uppercase font-black text-stone-400">Video Type</label>
                <select value={videoType} onChange={(e) => setVideoType(e.target.value as any)} className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg text-slate-800 dark:text-white">
                  <option value="youtube">YouTube Video</option>
                  <option value="vimeo">Vimeo Video</option>
                  <option value="mp4">Local Uploaded MP4</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase font-black text-stone-400">Video URL / Video ID</label>
                <input 
                  type="text" 
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)} 
                  placeholder={videoType === "youtube" ? "https://www.youtube.com/watch?v=..." : videoType === "vimeo" ? "https://vimeo.com/..." : "/uploads/video.mp4"} 
                  className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 outline-none text-xs p-2.5 rounded-lg text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowVideoModal(false)} className="px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg text-[10px] uppercase font-bold text-slate-700 dark:text-stone-300">Cancel</button>
              <button type="button" onClick={insertVideoHtml} className="px-3 py-1.5 bg-brand-gold text-stone-950 rounded-lg text-[10px] uppercase font-bold" disabled={!videoUrl}>Embed</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
