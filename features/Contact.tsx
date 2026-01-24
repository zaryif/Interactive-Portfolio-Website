// This feature component displays the contact information and a contact form.
// It's structured in a two-column layout for larger screens.

import React, { useState } from 'react';
import type { ResumeData } from '../types';
import { Send, CheckCircle, Linkedin, Instagram, Facebook, Github, Mail } from 'lucide-react';
import { Spinner } from '../components/Spinner';

// A mapping from social media platform names to their corresponding Lucide icon components.
const platformIcons: { [key: string]: React.ElementType } = {
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
    github: Github,
    gmail: Mail,
};

// Defines the props for the Contact component.
interface ContactProps {
    resumeData: ResumeData;
}

const Contact: React.FC<ContactProps> = ({ resumeData }) => {
  // State to manage the form's input fields.
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  // State to manage the submission status of the form.
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  // State to hold any error messages from the submission.
  const [errorMessage, setErrorMessage] = useState('');

  // Updates the form data state when a user types in an input field.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handles the form submission by sending the data to a form handling service.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default browser form submission.
    if (!formData.name || !formData.email || !formData.message) {
      return; // Simple validation.
    }
    setStatus('sending');
    setErrorMessage('');

    try {
        // Use an AJAX-compatible endpoint from a service like Formsubmit.co.
        // This sends the email without a page redirect.
        const response = await fetch('https://formsubmit.co/ajax/zaryif.dev@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
            setStatus('sent');
            setFormData({ name: '', email: '', message: '' }); // Reset form on success.
        } else {
            throw new Error(data.message || 'An unknown error occurred.');
        }
    } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Failed to send message. Please try again later.');
    }
  };

  return (
    <section>
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        Get in Touch
      </h2>
      
      {/* The main grid container for the two-column layout. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Conditional rendering: Show a success message or the form. */}
        {status === 'sent' ? (
          // Success message displayed after form submission.
          <div className="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-lg p-6 flex flex-col items-center justify-center text-center h-full md:col-span-2">
            <CheckCircle size={48} className="mb-4" />
            <h3 className="text-xl font-semibold">Message Sent!</h3>
            <p>Thank you for reaching out. I will get back to you shortly.</p>
          </div>
        ) : (
          // Display the form and contact info.
          <>
            {/* Left Column: Contains profile picture, quote, and social media links. */}
            <div className="space-y-8">
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={resumeData.profilePictureUrl} 
                    alt={resumeData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-500/20 shadow-lg mb-4"
                  />
                  <blockquote className="font-pixel text-2xl text-[var(--header-text)]">
                    "Think & Change"
                  </blockquote>
                </div>

                <div>
                    <h3 className="font-semibold text-[var(--text-color)] text-lg text-center md:text-left">Connect with me</h3>
                    <p className="text-[var(--subtle-text)] text-sm text-center md:text-left">You can also find me on these platforms:</p>
                    <div className="flex flex-col gap-4 mt-4">
                        {/* Map over social media data to render links. */}
                        {resumeData.additionalInfo.socialMedia.map((social) => {
                            const Icon = platformIcons[social.platform.toLowerCase()];
                            return (
                                <a 
                                    key={social.platform} 
                                    href={social.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-3 p-3 bg-gray-500/5 hover:bg-gray-500/10 rounded-lg transition-colors"
                                    title={social.platform}
                                >
                                    {Icon && <Icon size={24} className="text-[var(--header-text)]" />}
                                    <div>
                                        <span className="font-semibold text-[var(--text-color)]">{social.platform}</span>
                                        <span className="block font-mono text-sm text-[var(--subtle-text)]">{social.handle}</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Right Column: Contains the contact form. */}
            <div>
              <p className="font-pixel text-xl text-center md:text-left text-[var(--header-text)] mb-4">
                I prefer to be contacted via email, but this form works just as well.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className="w-full bg-stone-200 dark:bg-stone-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className="w-full bg-stone-200 dark:bg-stone-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500" 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Message</label>
                  <textarea 
                    id="message" 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required 
                    rows={5} 
                    className="w-full bg-stone-200 dark:bg-stone-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
                  >
                    {status === 'sending' ? <Spinner /> : <Send size={20} />}
                    <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
                {/* Display an error message if the submission fails. */}
                {status === 'error' && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-2">{errorMessage}</p>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Contact;