import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../AuthContext";

const PackagesForm = ({ theme = 'dark' }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    duration: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const { apiFetch } = useAuth();

  useEffect(() => {
    fetchPackages();
  }, [apiFetch]);

  const fetchPackages = async () => {
    try {
      const response = await apiFetch("/studio/packages/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log("Fetched packages:", data);
        }
        setPackages(data.results || data);
      } else if (response.status !== 404) {
        const errorData = await response.json();
        setApiError(errorData.message || "Failed to load packages");
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setApiError("Network error occurred");
    } finally {
      setInitialLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      description: "",
      duration: "",
    });
    setFormErrors({});
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (success) setSuccess("");
    if (apiError) setApiError("");

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Package title is required";
    } else if (form.title.length > 100) {
      errors.title = "Package title cannot exceed 100 characters";
    }

    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) {
      errors.price = "Valid price is required";
    } else if (form.price.length > 10) {
      errors.price = "Price cannot exceed 10 digits";
    }

    if (form.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (form.duration.length > 50) {
      errors.duration = "Duration cannot exceed 50 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        title: form.title.trim(),
        price: parseFloat(form.price),
        description: form.description.trim() || null,
        duration: form.duration.trim() || null,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log("Submitting package:", payload);
      }

      const url = editingId ? `/studio/packages/${editingId}/` : "/studio/packages/";
      const method = editingId ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        if (editingId) {
          setPackages((prev) => prev.map((pkg) => (pkg.id === editingId ? responseData : pkg)));
          setSuccess("Package updated successfully");
        } else {
          setPackages((prev) => [...prev, responseData]);
          setSuccess("Package created successfully");
        }
        resetForm();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        if (responseData.errors) {
          setFormErrors(responseData.errors);
        } else {
          setApiError(responseData.message || "Failed to save package");
        }
      }
    } catch (error) {
      console.error("Error saving package:", error);
      setApiError("Network error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg) => {
    setForm({
      title: pkg.title || "",
      price: pkg.price.toString() || "",
      description: pkg.description || "",
      duration: pkg.duration || "",
    });
    setEditingId(pkg.id);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const response = await apiFetch(`/studio/packages/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
        setSuccess("Package deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const responseData = await response.json();
        setApiError(responseData.message || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      setApiError("Network error occurred while deleting");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={`
          rounded-2xl shadow-xl border overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90  border-slate-700/60'
            : 'bg-white/90 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`ml-2 text-sm font-medium ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>Loading your packages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`
        rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90  border-slate-700/60'
          : 'bg-white/90 border-gray-200'
        }
      `}>
        <div className={`
          px-4 sm:px-6 py-4 border-b
          ${theme === 'dark'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-slate-700/60'
            : 'bg-gradient-to-r from-green-400 to-emerald-500 border-gray-200'
          }
          
        `}>
          <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Service Packages</h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-green-200' : 'text-gray-600'
          }`}>Create and manage your service packages</p>
        </div>

        {success && (
          <div className={`
            mx-4 sm:mx-6 mt-4 p-4 rounded-xl flex items-center animate-fadeIn
            ${theme === 'dark'
              ? 'bg-green-500/10 border border-green-500/30 '
              : 'bg-green-50/80 border border-green-200'
            }
          `}>
            <CheckCircle className={`w-5 h-5 mr-2 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-green-300' : 'text-green-800'
            }`}>{success}</span>
          </div>
        )}

        {apiError && (
          <div className={`
            mx-4 sm:mx-6 mt-4 p-4 rounded-xl flex items-center animate-fadeIn
            ${theme === 'dark'
              ? 'bg-red-500/10 border border-red-500/30 '
              : 'bg-red-50/80 border border-red-200'
            }
          `}>
            <AlertCircle className={`w-5 h-5 mr-2 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>{apiError}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8">
          <div className={`
            rounded-xl p-4 sm:p-6 mb-6
            ${theme === 'dark'
              ? 'bg-slate-700/50 border border-slate-600/50 '
              : 'bg-gray-50/80 border border-gray-200'
            }
          `}>
            <h3 className={`text-base sm:text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
            }`}>
              {editingId ? "Edit Package" : "Add New Package"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Wedding Photography"
                  value={form.title}
                  onChange={handleFormChange}
                  className={`
                    w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 
                    ${theme === 'dark'
                      ? formErrors.title
                        ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                      : formErrors.title
                        ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
                {formErrors.title && (
                  <p className={`mt-1 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="50000"
                  value={form.price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  className={`
                    w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 
                    ${theme === 'dark'
                      ? formErrors.price
                        ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                      : formErrors.price
                        ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
                {formErrors.price && (
                  <p className={`mt-1 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>{formErrors.price}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g., 4 hours, Full day"
                  value={form.duration}
                  onChange={handleFormChange}
                  className={`
                    w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 
                    ${theme === 'dark'
                      ? formErrors.duration
                        ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                      : formErrors.duration
                        ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
                {formErrors.duration && (
                  <p className={`mt-1 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>{formErrors.duration}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe what's included in this package..."
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  className={`
                    w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200  resize-vertical
                    ${theme === 'dark'
                      ? formErrors.description
                        ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                      : formErrors.description
                        ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
                {formErrors.description && (
                  <p className={`mt-1 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>{formErrors.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`
                  inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg
                  ${loading
                    ? theme === 'dark'
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-500/25'
                      : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-green-400/25'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingId ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {editingId ? "Update Package" : "Add Package"}
                  </>
                )}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className={`
                    inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105
                    ${loading
                      ? theme === 'dark'
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-slate-600/50 text-white hover:bg-slate-600/70'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }
                  `}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {packages.length > 0 && (
            <div>
              <h3 className={`text-base sm:text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
              }`}>Your Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`
                      border rounded-xl p-5 transition-all duration-300 transform hover:shadow-xl
                      ${theme === 'dark'
                        ? editingId === pkg.id
                          ? 'bg-green-500/10 border-green-500/30 '
                          : 'bg-slate-700/50 border-slate-600/50 '
                        : editingId === pkg.id
                          ? 'bg-green-50/80 border-green-200'
                          : 'bg-white/70 border-gray-200/50'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`font-semibold text-base sm:text-lg ${
                        theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                      }`}>{pkg.title}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(pkg)}
                          disabled={loading}
                          className={`
                            p-1 rounded transition-all duration-200 transform hover:scale-105
                            ${theme === 'dark'
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20'
                              : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title="Edit package"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          disabled={loading}
                          className={`
                            p-1 rounded transition-all duration-200 transform hover:scale-105
                            ${theme === 'dark'
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title="Delete package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xl sm:text-2xl font-bold ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>₦{parseFloat(pkg.price).toLocaleString()}</span>
                        {pkg.duration && (
                          <span className={`
                            text-xs sm:text-sm font-medium px-2 py-1 rounded
                            ${theme === 'dark' ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-100 text-gray-500'}
                          `}>
                            {pkg.duration}
                          </span>
                        )}
                      </div>

                      {pkg.description && (
                        <p className={`text-sm leading-relaxed ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`}>{pkg.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packages.length === 0 && !initialLoading && (
            <div className={`
              text-center py-12
              ${theme === 'dark'
                ? 'bg-slate-700/50 border border-slate-600/50 rounded-xl '
                : 'bg-gray-50/80 border border-gray-200 rounded-xl'
              }
            `}>
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                ${theme === 'dark' ? 'bg-slate-600/50' : 'bg-gray-100'}
              `}>
                <Plus className={`w-8 h-8 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                }`} />
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>No packages created yet. Add your first package above.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .resize-vertical {
          resize: vertical;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(100, 116, 139, 0.5)' : 'rgba(107, 114, 128, 0.5)'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(148, 163, 184, 0.7)' : 'rgba(75, 85, 99, 0.7)'};
        }
      `}</style>
    </div>
  );
};

export default PackagesForm;