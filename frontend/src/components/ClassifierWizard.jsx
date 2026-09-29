import React, { useState } from 'react';

const PRESETS = [
  {
    label: "Classical Triphala Churna",
    data: {
      product_name: "Triphala Churna",
      intended_use: "therapeutic",
      is_in_authoritative_texts: true,
      processing_nature: "classical",
      has_synthetic_additives: false
    }
  },
  {
    label: "Phytopharmaceutical Bacopa",
    data: {
      product_name: "Standardized Bacopa Neuro-Extract (4 Markers)",
      intended_use: "therapeutic",
      is_in_authoritative_texts: false,
      processing_nature: "purified_fraction_with_markers",
      has_synthetic_additives: false
    }
  },
  {
    label: "Proprietary Herbal Syrup",
    data: {
      product_name: "Polyherbal Cough Relief Formula",
      intended_use: "therapeutic",
      is_in_authoritative_texts: false,
      processing_nature: "aqueous_alcoholic_extract",
      has_synthetic_additives: false
    }
  },
  {
    label: "Ayurveda Aahar Health Drink",
    data: {
      product_name: "Ayur-Digestive Botanical Infusion",
      intended_use: "dietary",
      is_in_authoritative_texts: true,
      processing_nature: "classical",
      has_synthetic_additives: false
    }
  },
  {
    label: "Kumkumadi Glow Oil",
    data: {
      product_name: "Kumkumadi Facial Glow Serum",
      intended_use: "cosmetic",
      is_in_authoritative_texts: false,
      processing_nature: "aqueous_alcoholic_extract",
      has_synthetic_additives: false
    }
  }
];

export default function ClassifierWizard({ onClassify, result, loading }) {
  const [formData, setFormData] = useState({
    product_name: "Novel Herbal Formulation",
    intended_use: "therapeutic",
    is_in_authoritative_texts: false,
    processing_nature: "aqueous_alcoholic_extract",
    has_synthetic_additives: false
  });

  const handleApplyPreset = (preset) => {
    setFormData(preset.data);
    onClassify(preset.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClassify(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Form Input Card */}
      <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🔬</span> Guided Formulation Classifier
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Rule-Based Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Determines regulatory classification (Classical vs. P&P vs. Phyto vs. Aahar vs. Cosmetic) and statutory IPR & ABS postures under Indian law.
        </p>

        {/* Quick Demo Presets */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Instant Demo Presets:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Product / Formulation Name
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Question 1: Intended Use */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              1. Intended Commercial & Health Use
            </label>
            <select
              value={formData.intended_use}
              onChange={(e) => setFormData({ ...formData, intended_use: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="therapeutic">Therapeutic (Treating, curing, or preventing disease)</option>
              <option value="dietary">Dietary Wellness / Nutrition (Food supplement / Ayurveda Aahar)</option>
              <option value="cosmetic">Cosmetic (Cleansing, beautifying, external skin/hair care)</option>
            </select>
          </div>

          {/* Question 2: In First Schedule Texts */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              2. Documented in First Schedule Classical Texts?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_in_authoritative_texts: true })}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                  formData.is_in_authoritative_texts
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                Yes (Charaka, Sushruta, etc.)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_in_authoritative_texts: false })}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                  !formData.is_in_authoritative_texts
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                No / Modified / Proprietary
              </button>
            </div>
          </div>

          {/* Question 3: Processing Nature */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              3. Processing / Extraction Method
            </label>
            <select
              value={formData.processing_nature}
              onChange={(e) => setFormData({ ...formData, processing_nature: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="classical">Traditional Classical (Kwath, Churna, Taila, Asava, Bhasma)</option>
              <option value="aqueous_alcoholic_extract">Standard Extract / Admixture (Aqueous/Alcoholic extract)</option>
              <option value="purified_fraction_with_markers">Purified Fraction with ≥ 4 Bioactive Markers (Phyto)</option>
            </select>
          </div>

          {/* Question 4: Synthetic Additives */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_synthetic_additives}
                onChange={(e) => setFormData({ ...formData, has_synthetic_additives: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Contains synthetic vitamins, minerals, or modern chemical APIs
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Classifying...</span>
              </>
            ) : (
              <span>Evaluate Formulation & IPR Posture ➔</span>
            )}
          </button>
        </form>
      </div>

      {/* Output Result Card */}
      <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        {result ? (
          <div className="space-y-5">
            {/* Top Category Header */}
            <div className="border-b border-slate-700 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Evaluation for: <span className="text-white font-bold">{result.product_name}</span>
              </span>
              <div className="flex items-center justify-between mt-1.5 flex-wrap gap-2">
                <h3 className="text-xl font-extrabold text-emerald-400">
                  {result.category}
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono text-slate-300 font-semibold">
                  {result.category_code}
                </span>
              </div>
            </div>

            {/* Governing Law & Licensing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-semibold block mb-1">Governing Statute</span>
                <span className="text-white font-medium">{result.governing_law}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-semibold block mb-1">Licensing Authority</span>
                <span className="text-emerald-300 font-medium">{result.licensing_authority}</span>
              </div>
            </div>

            {/* Patentability Posture (Sec 3(p) Analysis) */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>⚖️</span> Patentability Posture (Section 3(p) Analysis)
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {result.patentability?.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                {result.patentability?.assessment}
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">Recommended IP Strategy: </span>
                <span className="text-slate-200">{result.patentability?.recommended_ip_strategy}</span>
              </div>
            </div>

            {/* ABS / Biodiversity Act Compliance */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <span>🌿</span> ABS & Biodiversity Act Compliance
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {result.abs_compliance?.form_type}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {result.abs_compliance?.guidance}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold">Statutory Basis:</span>
                <span>{result.abs_compliance?.statutory_provisions?.join(', ')}</span>
              </div>
            </div>

            {/* Warnings banner if present */}
            {result.warnings?.length > 0 && (
              <div className="bg-rose-950/40 border border-rose-600/30 p-3 rounded-xl text-xs text-rose-300 space-y-1">
                {result.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-500 space-y-3">
            <span className="text-4xl">📋</span>
            <h4 className="text-base font-semibold text-slate-300">No Formulation Evaluated Yet</h4>
            <p className="text-xs max-w-sm">
              Use the form on the left or select an instant preset to see regulatory classification and IP/ABS guidance.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
