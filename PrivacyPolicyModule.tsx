import React, { useState } from 'react';

export const PrivacyPolicyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'security' | 'interop'>('privacy');

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-slate-200">
      {/* Top Header Bar with Coserveu Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/30">
              C
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Coserveu Platform
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono">
                  Official Privacy Policy
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Coserveu Statutory Compliance &amp; Accounting Suite
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <span className="hover:text-blue-400 cursor-pointer">Company</span>
            <span className="hover:text-blue-400 cursor-pointer">CoserveuPrime</span>
            <span className="hover:text-blue-400 cursor-pointer">CoserveuCapital</span>
            <span className="hover:text-blue-400 cursor-pointer">CoserveuEducation</span>
            <span className="hover:text-blue-400 cursor-pointer">Pricing</span>
            <span className="hover:text-blue-400 cursor-pointer">Community</span>
            <span className="hover:text-blue-400 cursor-pointer">Customer Hub</span>
          </div>
        </div>

        {/* Policy Navigation Tabs */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📜 Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'terms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 Terms of Use
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛡️ Security &amp; Data Protection
          </button>
          <button
            onClick={() => setActiveTab('interop')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'interop'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔄 XML &amp; ERP Interoperability
          </button>
        </div>
      </div>

      {/* Main Privacy Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl text-slate-200 leading-relaxed text-sm space-y-6">
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-2xl font-black text-white tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-400 mt-1">
                Last Updated: June 2026 · Applicable to Coserveu Platform Users
              </p>
            </div>

            {/* Introduction */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Introduction</h2>
              <p>
                Coserveu and/or its subsidiary(ies) or its associate(s) and/or affiliate(s) (collectively referred to as the &quot;Company” or “We” or “Coserveu&quot;) is committed to protect the privacy of its Customers, Partners, Employees or anyone who interacts with us (collectively referred to as “User” or “You” or “Your”) at-rest, in-use, and in-motion in order to safeguard the business interest and reputation without causing any interruption in their day-to-day business proceedings. The following are our guiding principles regarding privacy:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>Ask for only the least amount of information necessary, gathering only what we believe is essential for doing business, or for the specific transaction at hand.</li>
                <li>Effective, efficient and sustainable processes for sharing data with employees, partners and vendors.</li>
                <li>Strict approval and authorization mechanism to access the information collected.</li>
                <li>Higher control, visibility and strong technologies in our tools and applications with respect to usage and protection of information.</li>
                <li>Specific purpose for all information collected.</li>
              </ul>
              <p>
                This Privacy Policy explains our policy regarding the collection, use, disclosure, transfer or otherwise processing of your data by Coserveu, which operates various websites, platforms, offline and other services including but not limited to delivery of data and content via any mobile or internet connected device or otherwise (collectively the &quot;Services&quot;). The policy covers the following aspects:
              </p>
              <ul className="list-decimal pl-6 space-y-1 text-blue-300 font-medium">
                <li>Definitions</li>
                <li>Collection of Data</li>
                <li>Use of collected information</li>
                <li>Disclosures</li>
                <li>Security of data collected</li>
                <li>Your rights and choices</li>
                <li>General information</li>
                <li>Changes to the privacy policy</li>
                <li>Grievance redressal</li>
              </ul>
              <p className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-xs text-slate-300">
                By accessing the Company website or this application (“Platform”) or otherwise using the Services, you consent to collection, storage, use, disclosure or otherwise processing of the data that you provide (including your sensitive personal information) in accordance with this Privacy Policy for any of the platform or services that Coserveu offer. Before sharing any information representing any third party or any other person/people, you represent that you have the authority to do so and to permit us to use the information in accordance with this Privacy Policy. Your personal information will primarily be stored and processed in India only.
              </p>
            </section>

            {/* Definitions */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Definitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">“Customer”, “User”, “You”, “Your”</strong>
                  Means any individual, entity or organization, having entered into any commercial transaction with Coserveu and/or whose data is being collected by any other means.
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">“Website(s)”</strong>
                  Means any website(s) Coserveu own and operate such as coserveu.netlify.app, help.coserveu.com or any web pages or social networks that post a link to this privacy policy.
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">“Coserveu”, “We”, “us”</strong>
                  Means Coserveu and/or its subsidiary(ies) and/or its associate(s), and/or affiliate(s).
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">“Coserveu Partners”</strong>
                  Means businesses who are authorized to sell Coserveu products and Services by Coserveu.
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">“Personal Data”, “Data”</strong>
                  Refers to all the personal, non-anonymized data provided by the Customer or any other stakeholder.
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">“Sensitive Personal Data”</strong>
                  Means such personal information which consists of information relating to password, financial information, health condition, sexual orientation, medical records, biometric information as defined in IT Rules 2011.
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Data Collection</h2>
              <p>
                When you use our Platform, we collect and store your information which is provided by you from time to time. In general, you may browse the Platform without telling us who you are or revealing any personal information about yourself. Once you give us your personal information, you are not anonymous to us. You always have the option to not provide information by choosing not to use a particular service or product provided by us.
              </p>
              <p>Coserveu may collect, store and use the following kinds of Personal Information such as email address, your physical address, name, phone number and mobile number during:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
                <li>Online and offline data submission, by filling forms online and providing name, mobile number, email ID or providing your contact information by contacting us through phone, SMS, chat or mail.</li>
                <li>Events, trade shows or other marketing activities, the personal information that you provide.</li>
                <li>Sharing of billing information such as name, email id, mobile number and other information with Coserveu or Coserveu partners.</li>
                <li>At the time of product usage and activating license, sharing of admin ID etc.</li>
                <li>When you send us personal correspondence, such as emails or letters.</li>
              </ul>
              <p>
                We will also collect your information related to your transactions on our platform and such third-party business partner platforms. When such third-party business partner collects your personal information directly from you, you will be governed by their privacy policies as well.
              </p>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 mt-2">
                <h3 className="font-bold text-blue-400">Cookies &amp; Tracking Technologies</h3>
                <p className="text-xs text-slate-400">
                  Our Sites use cookies and other technologies to function effectively. These technologies record Data about your use of our Sites, including: Browser and device data (IP address, device type, OS, resolution, browser type/language); Usage data (time spent, pages visited, links clicked, referring URL).
                </p>
              </div>
            </section>

            {/* Use of collected information */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Use of Collected Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wide">Advertising and Marketing</h3>
                  <p className="text-xs text-slate-300">
                    Coserveu may use your personal data to advertise and provide personalized information about our products and services, on our sites and on third party sites. Further to this we may also invite you to participate optionally in events and surveys.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wide">Customer Support &amp; Service Delivery</h3>
                  <p className="text-xs text-slate-300">
                    Coserveu may use the data collected to identify you and provide a personalized support across different touch points. To the extent permissible under applicable law, we use your information to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-xs text-slate-400 mt-1">
                    <li>Provide any information and services that you have requested or ordered.</li>
                    <li>Provide, maintain, protect, and improve any applications, products, services, and information.</li>
                    <li>Manage and administer your use of applications, products, and services.</li>
                    <li>Provide you with any information that we are required to send you to comply with legal obligations.</li>
                    <li>Detect, prevent, investigate, or remediate crime, illegal, or prohibited activities.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Disclosing Collected Information */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Disclosing Collected Information</h2>
              <p>Coserveu may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-300">
                <li>Any subsidiary or affiliate of Coserveu or any other entity/third-party/body corporate, in India or outside.</li>
                <li>Our service providers and agents (internet platform providers, payment processors, communication channels).</li>
                <li>Authorized Coserveu Partners helping deliver applications, products, and services.</li>
                <li>Professional service providers, market researchers, advertising companies, and social media platforms.</li>
                <li>Regulators, law enforcement agencies, and courts to meet legal obligations or respond to legal process.</li>
              </ul>
            </section>

            {/* Security of Data */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Security of Data</h2>
              <p>
                Coserveu will take required technical and organizational precautions to prevent the loss, misuse or manipulation of the information shared. Once your information is in our possession, we adhere to our security guidelines to protect it against unauthorized access. Coserveu will store all the information so collected, on our secure password protected servers.
              </p>
            </section>

            {/* Your Rights */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">Your Rights &amp; Choices</h2>
              <p>We want to make sure you are aware of your rights in relation to the personal data we process about you:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <strong className="text-blue-300 block">Right to be Informed</strong>
                  Right to know how personal data is processed.
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <strong className="text-blue-300 block">Right to Access</strong>
                  Get access to personal information held by Coserveu.
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <strong className="text-blue-300 block">Right to Object</strong>
                  Object to processing of all or part of personal data.
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <strong className="text-blue-300 block">Right to Rectify/Delete</strong>
                  Correct inaccurate or false misleading data.
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <strong className="text-blue-300 block">Right to Data Portability</strong>
                  Request sending a copy to another organisation.
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <strong className="text-blue-300 block">Right to Erasure &amp; Opt-Out</strong>
                  Request deletion and withdraw consent anytime.
                </div>
              </div>
            </section>

            {/* Retention & Grievance Redressal */}
            <section className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">
                Retention of Data &amp; Grievance Redressal
              </h2>
              <div className="bg-amber-950/30 border border-amber-800/80 p-4 rounded-lg space-y-2 text-xs">
                <p className="font-bold text-amber-300">GST 7-Year Statutory Audit Log Retention Notice:</p>
                <p className="text-slate-300">
                  Notwithstanding anything to the foregoing, all audit and transaction logs pertaining to Goods and Services Tax (GST) services will be retained for a mandatory minimum period of <strong>7 (seven) years</strong> as per statutory guidelines.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
                <p className="text-white font-bold font-sans text-sm">Grievance Redressal Officer Contact Details</p>
                <p>Name: Harsha Chakravarthy K N</p>
                <p>Designation: Data Privacy Office</p>
                <p>Address: No. 331 – 336, Raheja Arcade, Koramangala, Bangalore, Karnataka – 560 095</p>
                <p>Email: dataprivacy@Coserveusolutions.com | support@Coserveusolutions.com</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-amber-300 border-b border-slate-800 pb-2">Terms of Use</h2>
            <p className="text-xs text-slate-300">
              Use of our Platform is available only to persons who can form a legally binding contract under the Indian Contract Act, 1872. All user transactions, vouchers, stock entries, and GST return statements executed on this platform are governed by Indian law and Coserveu software agreements.
            </p>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-amber-300 border-b border-slate-800 pb-2">Security &amp; Encryption Standards</h2>
            <p className="text-xs text-slate-300">
              Coserveu implements bank-grade password security, audit trails, edit logs under Rule 11(g) of Companies (Audit and Auditors) Rules, and encrypted SSL/TLS communication layers for all cloud and local operations.
            </p>
          </div>
        )}

        {activeTab === 'interop' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-amber-300 border-b border-slate-800 pb-2">XML &amp; ERP Interoperability</h2>
            <p className="text-xs text-slate-300">
              The platform supports native import &amp; export of XML files, standard ERP XML formats, ledger structures, stock item masters, and voucher daybooks with 100% double-entry accounting precision.
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar for Coserveu */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-xs space-y-6 text-slate-400">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase text-[11px]">Our Products</h4>
            <ul className="space-y-1">
              <li>Coserveu Software Service</li>
              <li>CoserveuPrime Server</li>
              <li>CoserveuPrime Cloud Access</li>
              <li>CoserveuPrime Developer</li>
              <li>CoserveuCapital</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase text-[11px]">Get GST-Compliant</h4>
            <ul className="space-y-1">
              <li>GST Registration</li>
              <li>File GST Returns (GSTR-1, GSTR-3B)</li>
              <li>GSTR 2A / 2B Reconciliation</li>
              <li>Generate e-Invoice in CoserveuPrime</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase text-[11px]">Solutions for SMBs &amp; FPOs</h4>
            <ul className="space-y-1">
              <li>Accounting &amp; Billing Software</li>
              <li>Bookkeeping &amp; Daybook Software</li>
              <li>Inventory Management</li>
              <li>CBBO-ASRLM FPC Accounting</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase text-[11px]">Contact Info</h4>
            <p>AMR Tech Park II, No.23 &amp; 24, Hosur Main Road, Bangalore 560068, India</p>
            <p className="text-blue-300 font-bold">Customer Care: 080 68103666</p>
            <p className="text-slate-300">support@Coserveusolutions.com</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div>
            Copyright © 2026 Coserveu · All Rights Reserved
          </div>
          <div className="flex gap-4">
            <span className="text-blue-400 underline cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Use</span>
            <span>|</span>
            <span className="hover:text-slate-300 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

