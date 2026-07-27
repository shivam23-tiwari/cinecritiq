import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, MessageSquare } from 'lucide-react';

const faqs = [
  {
    question: 'How do I create an account?',
    answer: 'Simply click the "Sign In" button at the top right of the navigation bar. You can instantly sign in using your Google account.'
  },
  {
    question: 'Is CineVerse free to use?',
    answer: 'Yes! CineVerse is completely free to use. You can browse, search, and save movies to your watchlist at no cost.'
  },
  {
    question: 'How do I add movies to my favorites?',
    answer: 'When you are signed in, you can click the heart icon on any movie card or the "Add to favorites" button on a movie details page to save it to your personal watchlist.'
  },
  {
    question: 'Why are some movies missing images?',
    answer: 'We use the TMDB API for our movie database. Occasionally, older or less popular movies may not have a poster or backdrop image available in their database.'
  },
  {
    question: 'How do I write a review?',
    answer: 'Navigate to any movie details page. If you are signed in, you will see a "Write a Review" section where you can rate the movie and share your thoughts.'
  }
];

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 w-full max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          How can we help?
        </h1>
        <div className="relative max-w-xl mx-auto mt-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/20 text-white text-lg rounded-full pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
            placeholder="Search for answers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-16">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-[#38bdf8]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#38bdf8] text-xl font-bold">1</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Getting Started</h3>
          <p className="text-white/60 text-sm">Learn the basics of using CineVerse.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-[#38bdf8]/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-[#38bdf8]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Account & Profile</h3>
          <p className="text-white/60 text-sm">Manage your watchlist and settings.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-[#38bdf8]/20 flex items-center justify-center mx-auto mb-4">
             <MessageSquare className="w-6 h-6 text-[#38bdf8]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Community</h3>
          <p className="text-white/60 text-sm">Learn about reviews and interactions.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.filter(f => f.question.toLowerCase().includes(query.toLowerCase()) || f.answer.toLowerCase().includes(query.toLowerCase())).map((faq, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className="font-medium text-white">{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#38bdf8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/50" />
                )}
              </button>
              {openFaq === idx && (
                <div className="p-5 pt-0 text-white/70 text-sm leading-relaxed border-t border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-20 text-center">
         <p className="text-white/60 mb-4">Still need help?</p>
         <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto">
            <Mail className="w-5 h-5" /> Contact Support
         </button>
      </div>
    </div>
  );
}

const User = ({className}: {className?: string}) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
