import React, { useState } from "react";
import axios from "axios";


const TEACH_CATEGORIES = [
  "Programming",
  "Web Development",
  "Data Science",
  "AI & ML",
  "Mobile Apps",
  "UI/UX & Design",
  "Cloud & DevOps",
  "Cybersecurity",
  "Business & Marketing",
  "Soft Skills",
];

function Teach() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    categories: [],
    experience: 2,
    bio: "",
    mode: "videos",
    github: "",
    linkedin: "",
    website: "",
    agree: false,
  });

  const [idFile, setIdFile] = useState(null);

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const has = prev.categories.includes(cat);
      return {
        ...prev,
        categories: has
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post("http://localhost:5001/api/teacher/register", form);
      alert(res.data.message);
      console.log("Saved teacher:", res.data.teacher);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error registering teacher");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-violet-50 to-fuchsia-50">
      {/* Hero */}
      <div className="pt-28 pb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Become a Teacher on <span className="text-blue-600">LearnShare</span>
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Share your expertise, inspire thousands, and build your teaching brand.
        </p>
      </div>

      {/* Main two-column section */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Illustration / Mood */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[420px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop"
              alt="Teach & Inspire"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/70 via-violet-900/50 to-fuchsia-900/40" />
            <div className="relative z-10 p-8 md:p-10 lg:p-12 text-white h-full flex flex-col justify-end">
              <h2 className="text-3xl font-bold mb-3">Share your knowledge.</h2>
              <p className="text-white/90 leading-relaxed">
                Publish courses, host live sessions, and mentor learners across the globe.
                Choose your topics, set your style, and we’ll amplify your voice.
              </p>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <li className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
                  ✅ Build your profile
                </li>
                <li className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
                  ✅ Grow your audience
                </li>
                <li className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
                  ✅ Flexible formats
                </li>
                <li className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
                  ✅ Community support
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
              <div className="space-y-6">
                {/* Personal info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Details</h3>
                  <p className="text-sm text-gray-500">
                    Tell us a bit about yourself and what you want to teach.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Alex Johnson"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    What do you want to teach? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Select one or more categories.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEACH_CATEGORIES.map((cat) => {
                      const active = form.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={[
                            "rounded-lg border px-3 py-2 text-sm transition",
                            active
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700",
                          ].join(" ")}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {form.categories.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      Please choose at least one category.
                    </p>
                  )}
                </div>

                {/* Experience + Mode */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                      Years of Experience: <span className="font-semibold">{form.experience}</span>
                    </label>
                    <input
                      id="experience"
                      type="range"
                      min="0"
                      max="30"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                      className="mt-3 w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>30+</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Teaching Mode
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: "videos", label: "Videos" },
                        { key: "articles", label: "Articles" },
                        { key: "live", label: "Live Sessions" },
                        { key: "projects", label: "Project-Based" },
                      ].map((m) => (
                        <label
                          key={m.key}
                          className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition
                            ${
                              form.mode === m.key
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                            }`}
                        >
                          <input
                            type="radio"
                            name="mode"
                            value={m.key}
                            checked={form.mode === m.key}
                            onChange={() => setForm({ ...form, mode: m.key })}
                            className="hidden"
                          />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Short Bio
                  </label>
                  <textarea
                    id="bio"
                    rows="4"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell learners about your background, teaching style, and what to expect."
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                      GitHub
                    </label>
                    <input
                      id="github"
                      type="url"
                      value={form.github}
                      onChange={(e) => setForm({ ...form, github: e.target.value })}
                      placeholder="https://github.com/username"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website / Portfolio
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://yourdomain.com"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* ID Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload ID Proof (optional)
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-700
                        file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2
                        file:bg-blue-600 file:text-white file:cursor-pointer
                        hover:file:bg-blue-700"
                    />
                    {idFile && (
                      <span className="text-xs text-gray-600 truncate max-w-[50%]">
                        {idFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Agree */}
                <div className="flex items-start gap-3">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={form.agree}
                    onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="agree" className="text-sm text-gray-600">
                    I agree to the community guidelines and confirm the information provided is accurate.
                  </label>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold py-3 shadow-lg hover:opacity-95 active:scale-[0.99] transition"
                    disabled={!form.agree || form.categories.length === 0}
                    title={
                      !form.agree
                        ? "Please accept the guidelines"
                        : form.categories.length === 0
                        ? "Select at least one category"
                        : "Register as Teacher"
                    }
                  >
                    Register as Teacher
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    After submitting, we’ll review your profile and guide you to your teaching dashboard.
                  </p>
                </div>
              </div>
            </form>
          </div>
          {/* /Form */}
        </div>
      </div>
    </div>
  );
}

export default Teach;
