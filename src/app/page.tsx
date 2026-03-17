"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [myResumes, setMyResumes] = useState<any[]>([]);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('resume_user');
    
    // ✨ THE FIX: Agar banda login nahi hai, toh 100% Force Redirect maaro!
    if (!savedUserStr) {
      window.location.replace('/login');
      return;
    }

    // Agar login hai, toh details set karo
    const savedUser = JSON.parse(savedUserStr);
    setIsLoggedIn(true);
    setUserName(savedUser.name);
    
    const nameParts = savedUser.name.trim().split(' ');
    if (nameParts.length > 1) {
      setUserInitials((nameParts[0][0] + nameParts[1][0]).toUpperCase());
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      setUserInitials(nameParts[0][0].toUpperCase());
    }

    const savedResumesStr = localStorage.getItem('my_resumes');
    if (savedResumesStr) {
      setMyResumes(JSON.parse(savedResumesStr));
    }
    
    // Auth check complete, ab Dashboard dikhao
    setIsCheckingAuth(false);
  }, [router]);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('edit_resume_id');
    router.push('/builder');
  };

  const handleLogout = () => {
      localStorage.removeItem('resume_user');
      window.location.replace('/login');
  };

  const editResume = (id: number) => {
      localStorage.setItem('edit_resume_id', id.toString());
      router.push('/builder');
  };

  const deleteResume = (id: number) => {
      if(window.confirm("Are you sure you want to delete this resume?")) {
          const updated = myResumes.filter(r => r.id !== id);
          setMyResumes(updated);
          localStorage.setItem('my_resumes', JSON.stringify(updated));
      }
  };

  // Jab tak check ho raha hai, screen blank rakho taake Dashboard na dikhe
  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#F8FAFC]"></div>; 
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ResumeSaaS</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#my-resumes" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">My Dashboard</Link>
              <Link href="/cover-letter" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Cover Letters</Link>
              <Link href="#templates" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Templates</Link>
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {userInitials}
                </div>
                <span className="text-sm font-bold text-slate-700">Welcome, {userName.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">
                Log out
              </button>
              <button onClick={handleCreateClick} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow">
                Go to Builder
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            Build a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">professional resume</span> that gets you hired.
          </h1>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={handleCreateClick} className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 hover:bg-blue-700">
              Create New Resume
            </button>
          </div>
        </div>
      </section>

      {/* SAVED RESUMES SECTION */}
      <section id="my-resumes" className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Your Saved Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={handleCreateClick} className="h-72 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="font-bold text-slate-600 group-hover:text-blue-700">Create New</span>
            </div>

            {myResumes.map((resume, idx) => (
              <div key={idx} className="h-72 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all relative group flex flex-col">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm z-10">{resume.date}</div>
                <div className="h-40 bg-slate-100 border-b border-slate-200 flex items-center justify-center overflow-hidden relative">
                  <div className="w-32 h-40 bg-white shadow-md border border-slate-200 mt-10 rounded-t flex flex-col p-2">
                    <div className={`h-2 w-full mb-2 ${resume.template === 'creative' ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                    <div className="h-1 bg-slate-300 w-3/4 mb-1"></div>
                    <div className="h-1 bg-slate-300 w-full mb-1"></div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 truncate" title={resume.title}>{resume.title || 'Untitled Resume'}</h4>
                    <p className="text-sm text-slate-500 mt-1 capitalize">{resume.template} Template</p>
                  </div>
                  <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editResume(resume.id)} className="flex-1 text-center bg-blue-100 text-blue-700 font-semibold text-xs py-2 rounded hover:bg-blue-200 transition-colors">Edit</button>
                    <button onClick={() => deleteResume(resume.id)} className="flex-1 text-center bg-red-50 text-red-600 font-semibold text-xs py-2 rounded hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-bold tracking-widest uppercase text-blue-600 mb-2">The Ultimate Tool</h2>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              Everything you need to stand out.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Content Refinement</h3>
              <p className="text-slate-600 leading-relaxed">Transforms your basic bullet points into powerful, impact-driven achievements instantly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ATS-Optimized</h3>
              <p className="text-slate-600 leading-relaxed">Strictly coded to pass through Applicant Tracking Systems.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">High-Res PDF</h3>
              <p className="text-slate-600 leading-relaxed">Download your masterpiece as a pixel-perfect PDF file.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}