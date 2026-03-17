"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CoverLetterBuilder() {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // States for Cover Letter Data
  const [sender, setSender] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
  });

  const [recipient, setRecipient] = useState({
    hiringManager: 'Hiring Manager',
    companyName: 'Company Name',
    companyAddress: 'City, State, Zip',
  });

  const [letterDetails, setLetterDetails] = useState({
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    greeting: 'Dear',
    body: 'I am writing to express my strong interest in the open position at your company. With a solid background in my field and a proven track record of delivering high-quality results, I am confident in my ability to make an immediate impact on your team.\n\nThroughout my career, I have consistently demonstrated a strong work ethic, exceptional problem-solving skills, and a commitment to excellence. I thrive in dynamic environments and am always eager to take on new challenges.\n\nI am particularly drawn to your company\'s innovative approach and commitment to [mention a company value or recent project]. I would welcome the opportunity to contribute my skills and experience to your continued success.\n\nThank you for considering my application. I have attached my resume for your review and look forward to the possibility of discussing this opportunity with you further.',
    closing: 'Sincerely,',
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    const savedUserStr = localStorage.getItem('resume_user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      setSender(prev => ({
        ...prev,
        fullName: savedUser.name || '',
        email: savedUser.email || ''
      }));
    }
  }, []);

  const handleSenderChange = (e: React.ChangeEvent<HTMLInputElement>) => setSender({ ...sender, [e.target.name]: e.target.value });
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => setRecipient({ ...recipient, [e.target.name]: e.target.value });
  const handleLetterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLetterDetails({ ...letterDetails, [e.target.name]: e.target.value });

  const handleDownloadPDF = async () => {
    const element = document.getElementById('cover-letter-preview');
    if (!element) return;
    setIsDownloading(true);
    
    try {
      const parent = element.parentElement;
      let originalDisplay = '';
      if (parent) {
        originalDisplay = parent.style.display;
        parent.style.display = 'flex';
      }

      const canvas = await html2canvas(element, { 
        scale: 3,
        useCORS: true, 
        backgroundColor: '#ffffff'
      });

      if (parent) parent.style.display = originalDisplay;
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(sender.fullName ? `${sender.fullName.replace(/\s+/g, '_')}_Cover_Letter.pdf` : 'Cover_Letter.pdf');
    } catch (error) { 
      console.error(error);
      alert("Error generating PDF. Please try again."); 
    } finally { 
      setIsDownloading(false); 
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* LEFT PANEL: FORM BUILDER */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[45%] h-full bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
        <header className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Back to Dashboard">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Cover Letter Builder</h1>
          </div>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className={`px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}>
            {isDownloading ? 'Saving...' : 'Download PDF'}
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-10 pb-10">
            
            {/* Sender Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-200 pb-2">Your Details (Sender)</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label><input type="text" name="fullName" value={sender.fullName} onChange={handleSenderChange} placeholder="John Doe" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label><input type="text" name="jobTitle" value={sender.jobTitle} onChange={handleSenderChange} placeholder="Software Engineer" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Email</label><input type="email" name="email" value={sender.email} onChange={handleSenderChange} placeholder="john@example.com" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Phone</label><input type="text" name="phone" value={sender.phone} onChange={handleSenderChange} placeholder="+1 234 567 890" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">Location</label><input type="text" name="location" value={sender.location} onChange={handleSenderChange} placeholder="City, State, Zip" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-200 pb-2">Employer Details (Recipient)</h2>
              <div className="grid grid-cols-1 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Hiring Manager's Name</label><input type="text" name="hiringManager" value={recipient.hiringManager} onChange={handleRecipientChange} placeholder="Jane Smith" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label><input type="text" name="companyName" value={recipient.companyName} onChange={handleRecipientChange} placeholder="Tech Corp Inc." className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Company Address</label><input type="text" name="companyAddress" value={recipient.companyAddress} onChange={handleRecipientChange} placeholder="123 Business Rd, Tech City" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-200 pb-2">Letter Content</h2>
              <div className="grid grid-cols-1 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Date</label><input type="text" name="date" value={letterDetails.date} onChange={handleLetterChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Greeting</label><input type="text" name="greeting" value={letterDetails.greeting} onChange={handleLetterChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Main Body Paragraphs</label>
                  <textarea name="body" value={letterDetails.body} onChange={handleLetterChange} rows={12} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm leading-relaxed"></textarea>
                </div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">Closing</label><input type="text" name="closing" value={letterDetails.closing} onChange={handleLetterChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: DYNAMIC PREVIEW ENGINE */}
      {/* ========================================================= */}
      <div className="hidden lg:flex w-[55%] h-full bg-slate-500 p-8 overflow-y-auto justify-center items-start z-10">
        
        {/* A4 Paper Sized Preview */}
        <div id="cover-letter-preview" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl text-slate-800 font-sans mx-auto flex flex-col relative shrink-0">
          
          {/* Top Blue Accent Bar to match Modern Resume style */}
          <div className="h-4 w-full bg-blue-600 absolute top-0 left-0"></div>

          <div className="px-16 py-20 flex flex-col h-full flex-1">
            
            {/* Header: Sender Info */}
            <div className="border-b-2 border-slate-200 pb-8 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tight mb-1 break-words">{sender.fullName || 'YOUR NAME'}</h1>
                <h2 className="text-md font-semibold text-blue-600 uppercase tracking-widest break-words">{sender.jobTitle || 'PROFESSIONAL TITLE'}</h2>
              </div>
              <div className="text-right text-[10px] text-slate-600 font-medium space-y-1">
                {sender.phone && <p>{sender.phone}</p>}
                {sender.email && <p>{sender.email}</p>}
                {sender.location && <p>{sender.location}</p>}
              </div>
            </div>

            {/* Date & Recipient Info */}
            <div className="mb-10 text-[11px] text-slate-800 leading-relaxed">
              <p className="font-semibold mb-6">{letterDetails.date}</p>
              
              <div className="space-y-1">
                <p className="font-bold">{recipient.hiringManager}</p>
                <p className="font-semibold">{recipient.companyName}</p>
                <p className="text-slate-600">{recipient.companyAddress}</p>
              </div>
            </div>

            {/* Letter Body */}
            <div className="flex-1">
              <p className="text-[11px] text-slate-900 font-bold mb-4">
                {letterDetails.greeting} {recipient.hiringManager},
              </p>
              
              <div className="text-[11px] text-slate-700 leading-[1.8] whitespace-pre-wrap text-justify">
                {letterDetails.body}
              </div>
            </div>

            {/* Closing */}
            <div className="mt-12 text-[11px] text-slate-900">
              <p className="mb-8">{letterDetails.closing}</p>
              <p className="font-extrabold text-[14px]">{sender.fullName || 'Your Name'}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}