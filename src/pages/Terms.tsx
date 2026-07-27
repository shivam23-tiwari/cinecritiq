import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-white/80">
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Use</h1>
      <div className="space-y-6 text-sm md:text-base leading-relaxed">
        <p>
          Welcome to CineVerse. By accessing this website, we assume you accept these terms and conditions. 
          Do not continue to use CineVerse if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. License</h2>
        <p>
          Unless otherwise stated, CineVerse and/or its licensors own the intellectual property rights for all material on CineVerse. 
          All intellectual property rights are reserved. You may access this from CineVerse for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        
        <p>You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Republish material from CineVerse</li>
          <li>Sell, rent or sub-license material from CineVerse</li>
          <li>Reproduce, duplicate or copy material from CineVerse</li>
          <li>Redistribute content from CineVerse</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Comments</h2>
        <p>
          Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. 
          CineVerse does not filter, edit, publish or review Comments prior to their presence on the website. 
          Comments do not reflect the views and opinions of CineVerse, its agents and/or affiliates.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Content Liability</h2>
        <p>
          We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
        </p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Governing Law</h2>
        <p>
          These Terms will be governed by and interpreted in accordance with the laws of the State, and you submit to the non-exclusive jurisdiction of the state and federal courts located in the Country for the resolution of any disputes.
        </p>
      </div>
    </div>
  );
}
