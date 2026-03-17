"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function BuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // States
  const [personalInfo, setPersonalInfo] = useState({ fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', summary: '' });
  const [experiences, setExperiences] = useState([{ id: 1, company: '', position: '', duration: '', description: '' }]);
  const [educations, setEducations] = useState([{ id: 1, institution: '', degree: '', year: '', gpa: '' }]);
  const [skills, setSkills] = useState('');
  const [extraSectionTitle, setExtraSectionTitle] = useState('Languages & Certifications');
  const [extraSectionContent, setExtraSectionContent] = useState('');
  const [reference, setReference] = useState({ name: '', company: '', contact: '' });
  
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [template, setTemplate] = useState<'executive' | 'creative' | 'dark' | 'reversed'>('executive');
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // NAYI STATES: Save functionality ke liye
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✨ EDIT MODE LOGIC: Page khulte hi check karo user ne Dashboard se 'Edit' dabaya hai ya 'Create New'
  useEffect(() => {
    const editId = localStorage.getItem('edit_resume_id');
    
    if (editId) {
      // Editing existing resume
      const existingResumes = JSON.parse(localStorage.getItem('my_resumes') || '[]');
      const resumeToEdit = existingResumes.find((r: any) => r.id.toString() === editId);
      
      if (resumeToEdit) {
        setPersonalInfo(resumeToEdit.data.personalInfo);
        setExperiences(resumeToEdit.data.experiences);
        setEducations(resumeToEdit.data.educations);
        setSkills(resumeToEdit.data.skills);
        setExtraSectionTitle(resumeToEdit.data.extraSectionTitle);
        setExtraSectionContent(resumeToEdit.data.extraSectionContent);
        setReference(resumeToEdit.data.reference || { name: '', company: '', contact: '' });
        setProfilePic(resumeToEdit.data.profilePic);
        setTemplate(resumeToEdit.template);
        setEditingId(resumeToEdit.id);
      }
      localStorage.removeItem('edit_resume_id'); // Clear it
    } else {
      // Creating new resume, pre-fill just basic user info
      const savedUserStr = localStorage.getItem('resume_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        setPersonalInfo(prev => ({
          ...prev,
          fullName: savedUser.name || '',
          email: savedUser.email || ''
        }));
      }
    }
  }, []);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  const handleExpChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const newExp = [...experiences]; newExp[index] = { ...newExp[index], [e.target.name]: e.target.value }; setExperiences(newExp); };
  const addExperience = () => setExperiences([...experiences, { id: Date.now(), company: '', position: '', duration: '', description: '' }]);
  const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));
  const handleEduChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => { const newEdu = [...educations]; newEdu[index] = { ...newEdu[index], [e.target.name]: e.target.value }; setEducations(newEdu); };
  const addEducation = () => setEducations([...educations, { id: Date.now(), institution: '', degree: '', year: '', gpa: '' }]);
  const removeEducation = (index: number) => setEducations(educations.filter((_, i) => i !== index));
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setProfilePic(URL.createObjectURL(e.target.files[0])); };

  const handleAIRefine = (type: 'summary' | 'experience', index?: number) => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      if (type === 'summary') setPersonalInfo({ ...personalInfo, summary: `Innovative and results-driven professional with a proven track record of designing and implementing scalable, high-performance solutions. Adept at leveraging modern methodologies to optimize workflows and drive business growth. Strong problem-solving abilities combined with excellent communication skills to collaborate effectively with cross-functional teams.` });
      else if (type === 'experience' && index !== undefined) { const newExp = [...experiences]; newExp[index].description = `• Develop and execute comprehensive strategies that align with the company's goals and objectives.\n• Lead, mentor, and manage a high-performing team, fostering a collaborative and results-driven work environment.\n• Monitor brand consistency across all channels and materials to ensure high ROI.`; setExperiences(newExp); }
      setIsGeneratingAI(false);
    }, 800);
  };

  const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview');
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
      pdf.save(personalInfo.fullName ? `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Professional_Resume.pdf');
    } catch (error) { 
      console.error(error);
      alert("Error generating PDF. Please try again."); 
    } finally { 
      setIsDownloading(false); 
    }
  };

  // ✨ NAYA FUNCTION: Resume ko save karne ke liye
  const handleSaveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
        const resumeData = {
            id: editingId || Date.now(), // Agar edit kar rahay hain toh wahi ID rakho
            title: personalInfo.jobTitle ? `${personalInfo.fullName} - ${personalInfo.jobTitle}` : 'My Professional Resume',
            date: new Date().toLocaleDateString(),
            template: template,
            data: { personalInfo, experiences, educations, skills, extraSectionTitle, extraSectionContent, reference, profilePic }
        };

        let existing = JSON.parse(localStorage.getItem('my_resumes') || '[]');
        
        if (editingId) {
            existing = existing.map((r: any) => r.id === editingId ? resumeData : r);
        } else {
            existing.push(resumeData);
            setEditingId(resumeData.id); // Save hone ke baad usay Edit mode mein daal do taake multiple copies na bane
        }
        
        localStorage.setItem('my_resumes', JSON.stringify(existing));

        setIsSaving(false);
        alert('Resume saved to Dashboard successfully! 🎉');
    }, 800);
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
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Resume Builder</h1>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === step ? 'bg-blue-600 text-white' : currentStep > step ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{step}</div>
            ))}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-8 pb-10">
            
            {/* Step 1: Personal */}
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                <div className="flex items-center gap-4 mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  {profilePic ? <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" /> : <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">👤</div>}
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Profile Picture</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" name="fullName" value={personalInfo.fullName} onChange={handlePersonalChange} placeholder="YOUR NAME" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Professional Title</label><input type="text" name="jobTitle" value={personalInfo.jobTitle} onChange={handlePersonalChange} placeholder="YOUR PROFESSIONAL TITLE" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" value={personalInfo.email} onChange={handlePersonalChange} placeholder="email@example.com" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input type="text" name="phone" value={personalInfo.phone} onChange={handlePersonalChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium mb-1">Location</label><input type="text" name="location" value={personalInfo.location} onChange={handlePersonalChange} placeholder="City, State" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium mb-1">Website (Optional)</label><input type="text" name="website" value={personalInfo.website} onChange={handlePersonalChange} placeholder="www.yoursite.com" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" /></div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Profile Summary</label>
                    <textarea name="summary" value={personalInfo.summary} onChange={handlePersonalChange} rows={4} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500"></textarea>
                    <button onClick={() => handleAIRefine('summary')} disabled={isGeneratingAI} className="mt-2 text-xs text-purple-600 font-bold flex items-center gap-1">✨ {isGeneratingAI ? 'Refining...' : 'Refine with AI'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Work Experience</h2>
                {experiences.map((exp, index) => (
                  <div key={exp.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 relative">
                    {experiences.length > 1 && <button onClick={() => removeExperience(index)} className="absolute top-4 right-4 text-red-500 text-sm font-bold">Remove</button>}
                    <h3 className="font-bold mb-4 text-slate-700">Experience #{index + 1}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1">Company Name</label><input type="text" name="company" value={exp.company} onChange={(e) => handleExpChange(index, e)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                      <div><label className="block text-xs font-medium mb-1">Job Title</label><input type="text" name="position" value={exp.position} onChange={(e) => handleExpChange(index, e)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                      <div><label className="block text-xs font-medium mb-1">Duration</label><input type="text" name="duration" value={exp.duration} onChange={(e) => handleExpChange(index, e)} placeholder="2020 - PRESENT" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" /></div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1">Description (Bullet points)</label>
                        <textarea name="description" value={exp.description} onChange={(e) => handleExpChange(index, e)} rows={3} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm"></textarea>
                        <button onClick={() => handleAIRefine('experience', index)} disabled={isGeneratingAI} className="mt-1 text-xs text-purple-600 font-bold">✨ Refine with AI</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50">+ Add Another Job</button>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Education</h2>
                {educations.map((edu, index) => (
                  <div key={edu.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 relative">
                    {educations.length > 1 && <button onClick={() => removeEducation(index)} className="absolute top-4 right-4 text-red-500 text-sm font-bold">Remove</button>}
                    <h3 className="font-bold mb-4 text-slate-700">Degree #{index + 1}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1">Degree Name</label><input type="text" name="degree" value={edu.degree} onChange={(e) => handleEduChange(index, e)} placeholder="Master of Business Management" className="w-full px-3 py-2 border rounded-lg outline-none text-sm focus:border-blue-500" /></div>
                      <div><label className="block text-xs font-medium mb-1">Institution</label><input type="text" name="institution" value={edu.institution} onChange={(e) => handleEduChange(index, e)} className="w-full px-3 py-2 border rounded-lg outline-none text-sm focus:border-blue-500" /></div>
                      <div><label className="block text-xs font-medium mb-1">Year</label><input type="text" name="year" value={edu.year} onChange={(e) => handleEduChange(index, e)} placeholder="2029 - 2031" className="w-full px-3 py-2 border rounded-lg outline-none text-sm focus:border-blue-500" /></div>
                      <div><label className="block text-xs font-medium mb-1">GPA (Optional)</label><input type="text" name="gpa" value={edu.gpa} onChange={(e) => handleEduChange(index, e)} placeholder="3.8 / 4.0" className="w-full px-3 py-2 border rounded-lg outline-none text-sm focus:border-blue-500" /></div>
                    </div>
                  </div>
                ))}
                <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50">+ Add Another Degree</button>
              </div>
            )}

            {/* Step 4: Skills & Custom */}
            {currentStep === 4 && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Skills & Custom Section</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">Core Skills (Comma separated)</label>
                  <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Project Management, Teamwork, Leadership" className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mt-6">
                  <h3 className="font-bold text-slate-800 mb-4">Extra Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Section Title</label>
                      <input type="text" value={extraSectionTitle} onChange={(e) => setExtraSectionTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Items (Comma separated)</label>
                      <input type="text" value={extraSectionContent} onChange={(e) => setExtraSectionContent(e.target.value)} placeholder="e.g. AWS Certified, Agile, Scrum" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: TEMPLATE SELECTOR & Finish */}
            {currentStep === 5 && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Template & Finish</h2>
                
                <div className="mb-8">
                  <label className="block text-sm font-bold mb-3">Select Design Template</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setTemplate('executive')} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${template === 'executive' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="h-16 bg-slate-200 rounded mb-2 flex flex-col overflow-hidden"><div className="h-4 bg-slate-800 w-full"></div><div className="flex-1 flex"><div className="w-1/3 bg-slate-300"></div><div className="w-2/3 bg-white"></div></div></div>
                      <p className="text-xs font-bold text-center">Executive Timeline</p>
                    </div>
                    <div onClick={() => setTemplate('creative')} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${template === 'creative' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="h-16 bg-slate-200 rounded mb-2 flex overflow-hidden"><div className="w-full bg-[#3B82F6] h-4 absolute top-0 left-0"></div><div className="w-1/3 bg-slate-100 mt-4"></div><div className="w-2/3 bg-white mt-4"></div></div>
                      <p className="text-xs font-bold text-center">Blue Creative</p>
                    </div>
                    <div onClick={() => setTemplate('dark')} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${template === 'dark' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="h-16 bg-slate-200 rounded mb-2 flex overflow-hidden"><div className="w-1/3 bg-slate-800"></div><div className="w-2/3 bg-white"></div></div>
                      <p className="text-xs font-bold text-center">Dark Sidebar</p>
                    </div>
                    <div onClick={() => setTemplate('reversed')} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${template === 'reversed' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="h-16 bg-slate-200 rounded mb-2 flex overflow-hidden"><div className="w-2/3 bg-white border-r border-slate-300"></div><div className="w-1/3 bg-slate-100"></div></div>
                      <p className="text-xs font-bold text-center">Modern Reversed</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold mb-4 text-slate-700">Add a Reference (Optional)</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div><label className="block text-xs font-medium mb-1">Name</label><input type="text" value={reference.name} onChange={(e) => setReference({...reference, name: e.target.value})} placeholder="Estelle Darcy" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">Company / Title</label><input type="text" value={reference.company} onChange={(e) => setReference({...reference, company: e.target.value})} placeholder="Wardiere Inc. / CTO" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">Contact Details</label><input type="text" value={reference.contact} onChange={(e) => setReference({...reference, contact: e.target.value})} placeholder="Phone: 123-456-7890" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                </div>
                
                {/* ✨ NAYE BUTTONS: Save to Dashboard OR Download PDF */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button onClick={handleSaveResume} disabled={isSaving} className={`flex-1 py-4 text-blue-600 font-bold bg-blue-50 border-2 border-blue-600 rounded-xl shadow-sm hover:bg-blue-100 transition-all ${isSaving ? 'opacity-75 cursor-wait' : ''}`}>
                    {isSaving ? 'Saving...' : 'Save to Dashboard'}
                  </button>
                  <button onClick={handleDownloadPDF} disabled={isDownloading} className={`flex-1 py-4 text-white font-bold bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition-all ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}>
                    {isDownloading ? 'Generating PDF...' : 'Download My Resume'}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-between z-20">
          <button onClick={prevStep} disabled={currentStep === 1} className={`px-6 py-2.5 text-sm font-semibold rounded-lg ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'}`}>Back</button>
          {currentStep < totalSteps && <button onClick={nextStep} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Next Step</button>}
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: DYNAMIC PREVIEW ENGINE (STABLE FLEX LAYOUT) */}
      {/* ========================================================= */}
      <div className="hidden lg:flex w-[55%] h-full bg-slate-500 p-8 overflow-y-auto justify-center items-start z-10">
        
        <div id="resume-preview" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl text-slate-800 font-sans mx-auto flex flex-col">
          
          {template === 'executive' && (
            <div className="flex w-full flex-1 min-h-[297mm]">
              <div className="w-[35%] flex flex-col bg-[#E4E8ED] shrink-0 relative border-r border-slate-300">
                <div className="h-[180px] bg-[#2E3748] w-full shrink-0"></div>
                <div className="absolute top-[100px] left-0 w-full flex justify-center z-10">
                  {profilePic ? <img src={profilePic} className="w-[160px] h-[160px] rounded-full border-[8px] border-[#E4E8ED] object-cover bg-white" alt="Profile" /> : <div className="w-[160px] h-[160px] rounded-full border-[8px] border-[#E4E8ED] bg-slate-300"></div>}
                </div>
                <div className="pt-[100px] px-8 pb-10 flex flex-col gap-8 flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-[1.5px] border-slate-400 pb-2 mb-4">Contact</h3>
                    <ul className="text-[10px] text-slate-700 space-y-3 font-medium flex flex-col break-all">
                      <li className="flex items-center gap-3"><span className="text-lg shrink-0">📞</span> <span>{personalInfo.phone || '123-456-7890'}</span></li>
                      <li className="flex items-center gap-3"><span className="text-lg shrink-0">✉️</span> <span>{personalInfo.email || 'hello@example.com'}</span></li>
                      <li className="flex items-center gap-3"><span className="text-lg shrink-0">📍</span> <span className="break-words">{personalInfo.location || 'City, Country'}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-[1.5px] border-slate-400 pb-2 mb-4">Skills</h3>
                    <ul className="text-[10px] text-slate-700 font-medium list-disc pl-4 space-y-1.5 break-words pr-2">
                      {skills ? skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>) : <li>Your skills</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-[1.5px] border-slate-400 pb-2 mb-4 break-words">{extraSectionTitle}</h3>
                    <ul className="text-[10px] text-slate-700 font-medium list-disc pl-4 space-y-1.5 break-words pr-2">
                      {extraSectionContent ? extraSectionContent.split(',').map((item, i) => <li key={i}>{item.trim()}</li>) : <li>Your items here</li>}
                    </ul>
                  </div>
                  {reference.name && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-[1.5px] border-slate-400 pb-2 mb-4">Reference</h3>
                      <p className="text-[11px] font-bold mb-1 break-words">{reference.name}</p>
                      <p className="text-[10px] mb-1 break-words">{reference.company}</p>
                      <p className="text-[10px] font-medium whitespace-pre-line break-words">{reference.contact}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-[65%] flex flex-col bg-white shrink-0">
                <div className="h-[180px] bg-[#2E3748] w-full flex flex-col justify-center px-10 text-white shrink-0">
                  <h1 className="text-[2.5rem] leading-[1.1] font-extrabold uppercase tracking-wider mb-2 break-words">{personalInfo.fullName || 'YOUR NAME'}</h1>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-slate-300 break-words">{personalInfo.jobTitle || 'YOUR TITLE'}</h2>
                </div>
                <div className="px-10 py-10 flex flex-col gap-8 flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-3"><div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs shrink-0">👤</div><h3 className="text-sm font-extrabold uppercase tracking-widest">Profile</h3></div>
                    <p className="text-[11px] text-slate-600 leading-[1.6] text-justify whitespace-pre-wrap">{personalInfo.summary || 'Summary goes here...'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-5"><div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs shrink-0">💼</div><h3 className="text-sm font-extrabold uppercase tracking-widest">Experience</h3></div>
                    <div className="flex flex-col gap-6">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="relative pl-6 border-l-[1.5px] border-slate-400 ml-[11px]">
                          <div className="absolute -left-[5.5px] top-1 w-[9px] h-[9px] rounded-full bg-white border-[2px] border-slate-500"></div>
                          <div className="flex justify-between items-baseline mb-1"><h4 className="text-[12px] font-bold break-words pr-2">{exp.company || 'Company'}</h4><span className="text-[10px] font-semibold text-slate-500 uppercase shrink-0">{exp.duration || 'Date'}</span></div>
                          <p className="text-[11px] font-semibold text-slate-600 mb-2 break-words">{exp.position || 'Title'}</p>
                          <p className="text-[10px] text-slate-600 leading-[1.6] whitespace-pre-wrap text-justify">{exp.description || 'Description'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-5"><div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs shrink-0">🎓</div><h3 className="text-sm font-extrabold uppercase tracking-widest">Education</h3></div>
                    <div className="flex flex-col gap-6">
                      {educations.map((edu) => (
                        <div key={edu.id} className="relative pl-6 border-l-[1.5px] border-slate-400 ml-[11px]">
                          <div className="absolute -left-[5.5px] top-1 w-[9px] h-[9px] rounded-full bg-white border-[2px] border-slate-500"></div>
                          <div className="flex justify-between items-baseline mb-1"><h4 className="text-[12px] font-bold break-words pr-2">{edu.degree || 'Degree'}</h4><span className="text-[10px] font-semibold text-slate-500 uppercase shrink-0">{edu.year || 'Year'}</span></div>
                          <p className="text-[10px] text-slate-600 mb-1 break-words">{edu.institution || 'Institution'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {template === 'creative' && (
            <div className="flex flex-col w-full min-h-[297mm]">
              <div className="h-[140px] bg-[#3B82F6] w-full shrink-0"></div>
              <div className="flex w-full flex-1">
                <div className="w-[35%] flex flex-col bg-white border-r border-slate-200 shrink-0 relative">
                  <div className="absolute -top-[70px] left-0 w-full flex justify-center z-10">
                    {profilePic ? <img src={profilePic} className="w-[140px] h-[140px] rounded-2xl object-cover border-4 border-white shadow-lg bg-white" alt="Profile" /> : <div className="w-[140px] h-[140px] rounded-2xl bg-slate-200 border-4 border-white shadow-lg"></div>}
                  </div>
                  <div className="pt-[100px] px-8 pb-10 flex flex-col gap-8 flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3 border-b-2 border-slate-200 pb-1">CONTACT</h3>
                      <ul className="text-[10px] text-slate-700 space-y-3 font-semibold break-all pr-2">
                        <li>📞 {personalInfo.phone || '123-456-7890'}</li>
                        <li>✉️ {personalInfo.email || 'email@example.com'}</li>
                        <li>📍 <span className="break-words">{personalInfo.location || 'Location'}</span></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3 border-b-2 border-slate-200 pb-1">EDUCATION</h3>
                      <div className="flex flex-col gap-4">
                        {educations.map(edu => (
                          <div key={edu.id}>
                            <p className="text-[10px] font-bold text-slate-800">{edu.year || 'Year'}</p>
                            <p className="text-[11px] font-bold text-slate-900 break-words">{edu.institution || 'Institution'}</p>
                            <p className="text-[10px] text-slate-600 list-disc pl-3 mt-1 break-words">• {edu.degree || 'Degree'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3 border-b-2 border-slate-200 pb-1">SKILLS</h3>
                      <ul className="text-[10px] text-slate-700 font-semibold list-disc pl-4 space-y-1.5 break-words pr-2">
                        {skills ? skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>) : <li>Skills here</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="w-[65%] flex flex-col bg-white p-10 pt-8 gap-8 shrink-0">
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 break-words uppercase leading-[1.1]">{personalInfo.fullName || 'YOUR NAME'}</h1>
                    <h2 className="text-sm font-semibold tracking-widest text-slate-500 uppercase border-b-2 border-slate-200 pb-4 break-words">{personalInfo.jobTitle || 'PROFESSIONAL TITLE'}</h2>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3">PROFILE</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{personalInfo.summary || 'Summary text goes here.'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 border-b border-slate-200 pb-1">WORK EXPERIENCE</h3>
                    <div className="flex flex-col gap-6">
                      {experiences.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-[12px] font-bold text-slate-900 break-words pr-2">{exp.company || 'Company'}</h4>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase shrink-0">{exp.duration || 'Date'}</span>
                          </div>
                          <p className="text-[11px] italic text-slate-700 mb-2 break-words">{exp.position || 'Title'}</p>
                          <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap text-justify pl-3 border-l-2 border-slate-200">{exp.description || 'Description'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {template === 'dark' && (
            <div className="flex w-full min-h-[297mm]">
              <div className="w-[35%] bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-slate-300 flex flex-col p-8 shrink-0">
                <div className="w-full flex justify-center mb-8">
                  {profilePic ? <img src={profilePic} className="w-[150px] h-[150px] rounded-3xl object-cover border-2 border-slate-600 shadow-xl bg-white" alt="Profile" /> : <div className="w-[150px] h-[150px] rounded-3xl bg-slate-700"></div>}
                </div>
                <div className="flex flex-col gap-8 flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-widest mb-3">About Me</h3>
                    <p className="text-[10px] leading-relaxed text-justify whitespace-pre-wrap">{personalInfo.summary || 'Summary text goes here.'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-widest mb-3">Contact</h3>
                    <ul className="text-[10px] space-y-3 font-medium break-all pr-2">
                      <li>📞 {personalInfo.phone || '123-456-7890'}</li>
                      <li>✉️ {personalInfo.email || 'email@example.com'}</li>
                      <li>📍 <span className="break-words">{personalInfo.location || 'Location'}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-widest mb-3">Skills</h3>
                    <ul className="text-[10px] font-medium list-disc pl-4 space-y-1.5 break-words pr-2">
                      {skills ? skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>) : <li>Skills here</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-widest mb-3 break-words">{extraSectionTitle}</h3>
                    <ul className="text-[10px] font-medium list-disc pl-4 space-y-1.5 break-words pr-2">
                      {extraSectionContent ? extraSectionContent.split(',').map((item, i) => <li key={i}>{item.trim()}</li>) : <li>Your items</li>}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="w-[65%] bg-white p-10 flex flex-col gap-8 shrink-0">
                <div className="border-b-2 border-slate-800 pb-4">
                  <h1 className="text-[2.8rem] font-extrabold text-slate-900 leading-[1.1] break-words uppercase">{personalInfo.fullName || 'YOUR NAME'}</h1>
                  <h2 className="text-md font-semibold tracking-widest text-slate-600 mt-2 uppercase break-words">{personalInfo.jobTitle || 'PROFESSIONAL TITLE'}</h2>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 border-b border-slate-200 pb-1">Work Experience</h3>
                  <div className="flex flex-col gap-6">
                    {experiences.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="text-[14px] font-bold text-slate-900 break-words pr-2">{exp.position || 'Title'}</h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">{exp.duration || 'Date'}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 mb-2 break-words">{exp.company || 'Company'}</p>
                        <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap text-justify">{exp.description || 'Description'}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 border-b border-slate-200 pb-1">Education</h3>
                  <div className="flex flex-col gap-4">
                    {educations.map(edu => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <h4 className="text-[12px] font-bold text-slate-900 break-words pr-2">{edu.institution || 'Institution'}</h4>
                          <p className="text-[10px] font-semibold text-slate-600 mt-1 break-words">{edu.degree || 'Degree'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">{edu.year || 'Year'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {template === 'reversed' && (
            <div className="flex w-full min-h-[297mm] bg-white">
              <div className="w-[65%] p-10 flex flex-col gap-8 shrink-0 border-r border-slate-200">
                <div className="pt-4">
                  <h1 className="text-5xl font-black text-slate-800 leading-[1.1] tracking-tighter uppercase break-words">{personalInfo.fullName ? personalInfo.fullName.split(' ')[0] : 'YOUR'} <br/> {personalInfo.fullName ? personalInfo.fullName.split(' ').slice(1).join(' ') : 'NAME'}</h1>
                  <h2 className="text-sm font-semibold tracking-widest text-slate-500 mt-4 uppercase break-words">{personalInfo.jobTitle || 'PROFESSIONAL TITLE'}</h2>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3">PROFILE</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{personalInfo.summary || 'Summary text goes here.'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 border-b border-slate-200 pb-1">WORK EXPERIENCE</h3>
                  <div className="flex flex-col gap-6">
                    {experiences.map(exp => (
                      <div key={exp.id}>
                        <h4 className="text-[12px] font-bold text-slate-900 break-words">{exp.company || 'Company'} <span className="font-normal text-slate-500">| {exp.position || 'Title'}</span></h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic mb-2 block">{exp.duration || 'Date'}</span>
                        <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap text-justify">{exp.description || 'Description'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-[35%] bg-[#F8FAFC] p-8 flex flex-col shrink-0">
                <div className="w-full flex justify-center mb-8">
                  {profilePic ? <img src={profilePic} className="w-[140px] h-[140px] rounded-full object-cover shadow-md bg-white border-4 border-white" alt="Profile" /> : <div className="w-[140px] h-[140px] rounded-full bg-slate-300"></div>}
                </div>
                <div className="flex flex-col gap-8 flex-1">
                  <div>
                    <ul className="text-[10px] text-slate-700 space-y-3 font-semibold break-all pr-2">
                      <li>📞 {personalInfo.phone || '123-456-7890'}</li>
                      <li>✉️ {personalInfo.email || 'email@example.com'}</li>
                      <li>📍 <span className="break-words">{personalInfo.location || 'Location'}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3 text-center border-b border-slate-200 pb-1">EDUCATION</h3>
                    <div className="flex flex-col gap-4 text-center">
                      {educations.map(edu => (
                        <div key={edu.id}>
                          <p className="text-[11px] font-bold text-slate-800 break-words">{edu.institution || 'Institution'}</p>
                          <p className="text-[10px] text-slate-600 italic mt-1 break-words">{edu.degree || 'Degree'}</p>
                          <p className="text-[9px] text-slate-400 mt-1">{edu.year || 'Year'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-3 text-center border-b border-slate-200 pb-1">SKILLS</h3>
                    <ul className="text-[10px] text-slate-700 font-semibold list-none text-center space-y-1.5 break-words pr-2">
                      {skills ? skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>) : <li>Skills here</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}