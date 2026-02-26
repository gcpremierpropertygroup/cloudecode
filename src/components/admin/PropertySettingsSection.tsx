"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X as XIcon } from "lucide-react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

interface PropertySettings {
  propertyId: string;
  tagline: string;
  descriptionOverride: string;
  featured: boolean;
  sortOrder: number;
  amenities: string[];
  notes: string;
}

const EMPTY_SETTINGS: Omit<PropertySettings, "propertyId"> = {
  tagline: "",
  descriptionOverride: "",
  featured: false,
  sortOrder: 0,
  amenities: [],
  notes: "",
};

export default function PropertySettingsSection({ token }: { token: string }) {
  const [selectedProperty, setSelectedProperty] = useState(PROPERTY_OPTIONS[0].value);
  const [allSettings, setAllSettings] = useState<Record<string, PropertySettings | null>>({});
  const [settings, setSettings] = useState<Omit<PropertySettings, "propertyId">>(EMPTY_SETTINGS);
  const [newAmenity, setNewAmenity] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/property-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.settings) {
        setAllSettings(data.settings);
        const current = data.settings[selectedProperty];
        if (current) {
          const { propertyId: _id, ...rest } = current;
          setSettings({ ...EMPTY_SETTINGS, ...rest });
        } else {
          setSettings(EMPTY_SETTINGS);
        }
      }
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [token, selectedProperty]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const current = allSettings[selectedProperty];
    if (current) {
      const { propertyId: _id, ...rest } = current;
      setSettings({ ...EMPTY_SETTINGS, ...rest });
    } else {
      setSettings(EMPTY_SETTINGS);
    }
    setSuccess("");
    setError("");
  }, [selectedProperty, allSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/property-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId: selectedProperty, settings }),
      });
      if (res.ok) {
        setSuccess("Settings saved!");
        setAllSettings((prev) => ({
          ...prev,
          [selectedProperty]: { propertyId: selectedProperty, ...settings },
        }));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => {
    const trimmed = newAmenity.trim();
    if (trimmed && !settings.amenities.includes(trimmed)) {
      setSettings((prev) => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setSettings((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  if (loading && !Object.keys(allSettings).length) {
    return <p className="text-white/40">Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Property selector */}
      <div className="flex flex-wrap gap-2">
        {PROPERTY_OPTIONS.map((prop) => {
          const isActive = selectedProperty === prop.value;
          const hasSettings = !!allSettings[prop.value];
          return (
            <button
              key={prop.value}
              onClick={() => setSelectedProperty(prop.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
              }`}
            >
              {hasSettings && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
              {prop.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Settings form */}
      <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6 space-y-6">
        <h3 className="text-white font-semibold">Display Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
              placeholder="e.g. Charming home in historic Eastover"
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={settings.sortOrder}
                onChange={(e) => setSettings((s) => ({ ...s, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-24 px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, featured: !s.featured }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings.featured ? "bg-gold" : "bg-[#374151]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.featured ? "left-5" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-white/60 text-sm">Featured</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
            Description Override
          </label>
          <textarea
            value={settings.descriptionOverride}
            onChange={(e) => setSettings((s) => ({ ...s, descriptionOverride: e.target.value }))}
            placeholder="Override the default property description..."
            rows={4}
            className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
          />
        </div>

        {/* Amenities */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-white font-semibold mb-4">Amenities</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {settings.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-sm rounded-full"
              >
                {amenity}
                <button
                  onClick={() => removeAmenity(amenity)}
                  className="hover:text-white transition-colors"
                >
                  <XIcon size={12} />
                </button>
              </span>
            ))}
            {settings.amenities.length === 0 && (
              <p className="text-white/30 text-sm">No amenities added</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAmenity()}
              placeholder="Add amenity..."
              className="flex-1 px-4 py-2.5 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm"
            />
            <button
              onClick={addAmenity}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Admin notes */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-white font-semibold mb-4">Admin Notes</h3>
          <textarea
            value={settings.notes}
            onChange={(e) => setSettings((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Internal notes (not shown to guests)..."
            rows={3}
            className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
