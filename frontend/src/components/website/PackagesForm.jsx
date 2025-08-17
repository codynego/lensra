import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useApi } from "../../useApi";


const PackagesForm = () => {
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
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await apiFetch("/studio/packages/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setPackages(data.results || data);
      } else if (response.status !== 404) {
        setApiError("Failed to load packages");
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

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Package title is required";
    }

    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) {
      errors.price = "Valid price is required";
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
        title: form.title,
        price: parseFloat(form.price),
        description: form.description,
        duration: form.duration,
      };

      const url = editingId ? `/studio/packages/${editingId}/` : "/studio/packages/";
      const method = editingId ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
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
      title: pkg.title,
      price: pkg.price.toString(),
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading your packages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Service Packages</h2>
          <p className="text-gray-600 mt-1">Create and manage your service packages</p>
        </div>

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {apiError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{apiError}</span>
          </div>
        )}

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? "Edit Package" : "Add New Package"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Wedding Photography"
                  value={form.title}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-3 text-gray-900 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.title ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"
                  }`}
                  disabled={loading}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 text-gray-900 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.price ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"
                  }`}
                  disabled={loading}
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g., 4 hours, Full day"
                  value={form.duration}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe what's included in this package..."
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="inline-flex items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {packages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-white border rounded-lg p-5 hover:shadow-md transition-shadow ${
                      editingId === pkg.id ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">{pkg.title}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(pkg)}
                          disabled={loading}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit package"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">₦{parseFloat(pkg.price).toLocaleString()}</span>
                        {pkg.duration && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{pkg.duration}</span>
                        )}
                      </div>

                      {pkg.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">{pkg.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packages.length === 0 && !initialLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No packages created yet. Add your first package above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesForm;