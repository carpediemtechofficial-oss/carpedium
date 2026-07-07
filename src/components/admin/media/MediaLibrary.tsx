import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, UploadCloud, Trash2, Copy, CheckCircle2, Image as ImageIcon, FileText, Video, Eye, Calendar, HardDrive } from "lucide-react";

// Shared components
import SearchToolbar from "../shared/SearchToolbar";
import BulkToolbar from "../shared/BulkToolbar";
import EmptyState from "../shared/EmptyState";
import ActionDropdown from "../shared/ActionDropdown";

type ViewMode = "table" | "card";

export default function MediaLibrary() {
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("admin-media-view-mode") as ViewMode) || "card";
  });

  useEffect(() => {
    localStorage.setItem("admin-media-view-mode", viewMode);
  }, [viewMode]);

  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('media').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      
      if (error) throw error;
      
      // Filter out placeholder files like .emptyFolderPlaceholder
      return (data || []).filter(f => f.name !== '.emptyFolderPlaceholder');
    }
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (files || []).filter((f) => !q || f.name.toLowerCase().includes(q));
  }, [files, search]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      setUploading(false);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      setUploading(true);
      const { error } = await supabase.storage.from('media').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) throw error;
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      refetch();
    } catch (error: any) {
      alert("Error uploading file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this file? This may break images on the live site if they are currently being used.")) return;
    
    try {
      const { error } = await supabase.storage.from('media').remove([fileName]);
      if (error) throw error;
      refetch();
    } catch (error: any) {
      alert("Error deleting file: " + error.message);
    }
  };

  const handleBulkAction = async (action: "delete" | "publish" | "archive" | "export") => {
    if (checked.size === 0) return;
    if (action === "delete") {
      if (!confirm(`Delete ${checked.size} selected file(s)? This may break pages using them.`)) return;
      const { error } = await supabase.storage.from('media').remove(Array.from(checked));
      if (error) alert("Error deleting: " + error.message);
      else { setChecked(new Set()); refetch(); }
    }
  };

  const copyToClipboard = (fileName: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    navigator.clipboard.writeText(data.publicUrl);
    setCopiedUrl(fileName);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-8 w-8 text-slate-400" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-teal-600" />;
    if (mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-indigo-500" />;
    return <FileText className="h-8 w-8 text-slate-400" />;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const toggle = (name: string) =>
    setChecked((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const toggleAll = () => {
    const allChecked = filtered.every((f) => checked.has(f.name));
    setChecked((prev) => {
      const n = new Set(prev);
      filtered.forEach((f) => (allChecked ? n.delete(f.name) : n.add(f.name)));
      return n;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Media Library</h2>
          <p className="text-sm text-slate-500 mt-1">Upload and manage images, videos, and PDFs.</p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
        className="hidden" 
        accept="image/*,video/*,application/pdf"
      />

      {/* Search Toolbar */}
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search files by name..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refetch}
        onAdd={() => fileInputRef.current?.click()}
        addButtonText={uploading ? "Uploading..." : "Upload File"}
      />

      {/* Bulk operations */}
      <BulkToolbar
        selectedCount={checked.size}
        onClear={() => setChecked(new Set())}
        onAction={handleBulkAction}
        actions={["delete"]}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches found" : "Library is empty"}
          description={search ? "Try adjusting your query." : "Upload media assets to use in your course catalog pages and mentor profiles."}
          onAdd={search ? undefined : () => fileInputRef.current?.click()}
          addButtonText="Upload File"
          isSearch={!!search}
        />
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((file) => {
                const { data } = supabase.storage.from('media').getPublicUrl(file.name);
                const isImage = file.metadata?.mimetype?.startsWith('image/');
                
                return (
                  <div key={file.id} className="group relative bg-slate-50 rounded-xl border border-slate-205 overflow-hidden flex flex-col hover:border-teal-500/30 transition-all duration-300">
                    
                    {/* Checkbox */}
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={checked.has(file.name)}
                        onChange={() => toggle(file.name)}
                        className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </div>

                    <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative p-4">
                      {isImage ? (
                        <img 
                          src={data.publicUrl} 
                          alt={file.name} 
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        getFileIcon(file.metadata?.mimetype)
                      )}
                      
                      {/* Hover Actions overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(file.name)}
                          className="p-2 bg-white rounded-lg text-slate-700 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Copy URL"
                        >
                          {copiedUrl === file.name ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(file.name)}
                          className="p-2 bg-white rounded-lg text-slate-750 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-900 truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-1">{formatBytes(file.metadata?.size || 0)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 w-12">
                        <input type="checkbox" onChange={toggleAll}
                          checked={filtered.length > 0 && filtered.every((f) => checked.has(f.name))}
                          className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500" />
                      </th>
                      <th className="px-6 py-4">File Preview</th>
                      <th className="px-6 py-4">File Name</th>
                      <th className="px-6 py-4">Mime Type</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((file) => {
                      const { data } = supabase.storage.from('media').getPublicUrl(file.name);
                      const isImage = file.metadata?.mimetype?.startsWith('image/');
                      return (
                        <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <input type="checkbox" checked={checked.has(file.name)} onChange={() => toggle(file.name)}
                              className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500" />
                          </td>
                          <td className="px-6 py-3">
                            <div className="h-10 w-10 rounded border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                              {isImage ? (
                                <img src={data.publicUrl} alt={file.name} className="h-full w-full object-cover" />
                              ) : (
                                getFileIcon(file.metadata?.mimetype)
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-bold text-slate-800 truncate max-w-sm">{file.name}</p>
                          </td>
                          <td className="px-6 py-3 text-slate-500 font-mono text-xs">{file.metadata?.mimetype || "—"}</td>
                          <td className="px-6 py-3 text-slate-550 font-semibold text-xs">{formatBytes(file.metadata?.size || 0)}</td>
                          <td className="px-6 py-3 text-slate-450 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : "—"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => copyToClipboard(file.name)}
                                className="p-2 text-slate-400 hover:text-teal-650 hover:bg-slate-50 rounded-lg"
                                title="Copy URL"
                              >
                                {copiedUrl === file.name ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleDelete(file.name)}
                                className="p-2 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
