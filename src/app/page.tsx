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
    
    if (savedUserStr) {
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
      setIsCheckingAuth(false);

    } else {
      // BANDA LOGIN NAHI HAI, TOH DIRECT LOGIN PAGE PAR BHEJO
      router.push('/login');
    }
    
  }, [router]);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('edit_resume_id');
    router.push('/builder');
  };

  const handleLogout = () => {
      localStorage.removeItem('resume_user');
      setIsLoggedIn(false);
      setUserName('');
      setUserInitials('');
      setMyResumes([]);
      router.push('/login'); 
  };

  const editResume = (id: number) => {
      localStorage.setItem('edit_resume_id', id.toString());
      router.push('/builder');
  };

  const deleteResume = (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if(window.confirm("Are you sure you want to delete this resume?")) {
          const updated = myResumes.filter(r => r.id !== id);
          setMyResumes(updated);
          localStorage.setItem('my_resumes', JSON.stringify(updated));
      }
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#F8FAFC]"></div>; 
  }

  // ==========================================
  // VIEW: LOGGED-IN DASHBOARD
  // ==========================================
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Modern Dark Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm mr-3">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ResumeSaaS</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-lg transition-colors shadow-md shadow-blue-900/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="font-medium">My Resumes</span>
          </Link>
          <Link href="/cover-letter" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="font-medium">Cover Letters</span> <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span className="font-medium">Template Gallery</span>
          </Link>
          
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">Account</p>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="font-medium">Settings</span>
          </Link>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center font-bold text-white uppercase">
              {userInitials}
            </div>
            <div>
              <p className="text-sm font-bold text-white capitalize">{userName}</p>
              <p className="text-xs text-slate-400">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Dashboard Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log out
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">Welcome back, {userName.split(' ')[0]} 👋</h1>
                <p className="text-slate-500 mt-2 text-lg">Here is what's happening with your career documents.</p>
              </div>
              <button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create New Resume
              </button>
            </div>

            {/* Dynamic Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                <div><p className="text-3xl font-bold text-slate-900">{myResumes.length}</p><p className="text-sm font-medium text-slate-500">Saved Resumes</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></div>
                <div><p className="text-3xl font-bold text-slate-900">0</p><p className="text-sm font-medium text-slate-500">PDF Downloads</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div>
                <div><p className="text-3xl font-bold text-slate-900">{myResumes.length > 0 ? '100%' : '0%'}</p><p className="text-sm font-medium text-slate-500">Profile Strength</p></div>
              </div>
            </div>

            {/* REAL Saved Resumes Grid */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Create New Card */}
                <div onClick={handleCreateClick} className="group h-72 border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="font-bold text-slate-600 group-hover:text-blue-700">Create New Resume</span>
                </div>

                {/* Mapping Real Saved Resumes */}
                {myResumes.map((resume, idx) => (
                  <div key={idx} className="h-72 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group flex flex-col">
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm z-10">{resume.date}</div>
                    <div className="h-40 bg-slate-100 border-b border-slate-200 flex items-center justify-center overflow-hidden">
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
                        <button onClick={(e) => deleteResume(e, resume.id)} className="flex-1 text-center bg-red-50 text-red-600 font-semibold text-xs py-2 rounded hover:bg-red-100 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}