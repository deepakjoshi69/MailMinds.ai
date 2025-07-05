"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TemplateDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [originalTemplate, setOriginalTemplate] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchTemplate() {
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (!res.ok) {
          console.error("Template not found:", res.status);
          setTemplate(null);
          return;
        }
        const data = await res.json();
        setTemplate(data);
        setOriginalTemplate(JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [id]);

  const handleInputChange = (field, value) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSaveTemplate = async () => {
    try {
      toast.loading("Saving changes...");
      
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      if (res.ok) {
        toast.dismiss();
        toast.success("Template updated successfully! 🎉");
        setIsEditing(false);
        setUnsavedChanges(false);
        setOriginalTemplate(JSON.stringify(template));
      } else {
        toast.dismiss();
        toast.error("Failed to update template.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.dismiss();
      toast.error("Something went wrong.");
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      toast.loading("Deleting template...");
      
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.dismiss();
        toast.success("Template deleted successfully.");
        router.push("/dashboard/templates");
      } else {
        toast.dismiss();
        toast.error("Delete failed.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong.");
    }
  };

  const handleCancelEdit = () => {
    if (unsavedChanges) {
      setShowCancelModal(true);
    } else {
      setIsEditing(false);
    }
    
  };

  const confirmCancel = () => {
    setTemplate(JSON.parse(originalTemplate));
    setIsEditing(false);
    setUnsavedChanges(false);
    setShowCancelModal(false);
    toast.info("Editing cancelled. Changes discarded.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg text-red-500 font-semibold mb-4">Template not found.</p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            ⬅️ Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      <div className="h-16"></div>

      <div className="flex-grow p-6">
        <div className="flex gap-6">
          <div className="w-[70%] bg-white rounded-lg shadow-md p-6 overflow-hidden">
            <h2 className="text-xl font-semibold text-blue-600 mb-4 text-center">Email Template</h2>
            <div className="h-full p-4 border border-gray-200 rounded-md whitespace-pre-line text-gray-700 overflow-auto scrollbar-hide">
              {isEditing ? (
              
                <textarea
                value={template.content}
                  onChange={(e) => handleInputChange("content", e.target.value)
                  }
                  className="w-full h-full min-h-[500px] resize-none border-0 focus:ring-0 focus:outline-none p-0 text-gray-700 whitespace-pre-line bg-white"
                />
              ) : (
                <div >{template.content}</div>
              )}
            </div>
          </div>

          <div className="w-[30%] flex flex-col gap-5">
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true)
                  toast.info("Editing Mode Enable")
                }
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md transition-colors"
              >
                ✏️ Edit Template
              </button>
            ) : (
              <button
                onClick={()=>{handleCancelEdit
                  toast.info("Editing Mode Disable")
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold shadow-md transition-colors"
              >
                🚫 Disable Editing
              </button>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
              <input
                value={template.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                readOnly={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 text-base transition ${
                  isEditing
                    ? "border-blue-300 focus:ring-2 focus:ring-blue-400 bg-white"
                    : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={template.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                readOnly={!isEditing}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 text-base transition resize-none ${
                  isEditing
                    ? "border-blue-300 focus:ring-2 focus:ring-blue-400 bg-white"
                    : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl shadow font-medium transition-colors"
              >
                ⬅️ Go Back
              </button>

              <button
                onClick={handleSaveTemplate}
                disabled={!isEditing}
                className={`flex-1 py-3 rounded-xl font-semibold text-white shadow transition-all ${
                  isEditing
                    ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                    : "bg-green-200 cursor-not-allowed"
                }`}
              >
                💾 Save
              </button>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold shadow-md transition-colors"
            >
              🗑️ Delete Template
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Are you sure?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Do you really want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Discard changes?</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to exit editing mode? All changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}