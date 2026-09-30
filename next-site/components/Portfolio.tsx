'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import ConnectionStory from './ConnectionStory';
import { ArrowUpRight, ArrowDown, ArrowRight, Plus, Pause, Play, X, Menu, Copy, Check, ZoomIn, ZoomOut, Workflow, Layers3 } from 'lucide-react';
const Scene = dynamic(() => import('./Scene'), { ssr: false });
const base = process.env.NEXT_PUBLIC_BASE_PATH || '/ian-gutierrez-portfolio';
const asset = (s: string) => `${base}/${s}`;
const email = 'ianvan.gutierrez@gmail.com';
const linkedIn = 'https://www.linkedin.com/in/ian-gutierrez-bba2131ab/';
const projects = [
  {slug:'vendor-map',name:'A clearer view of every vendor.',short:'Vendor map',org:'RG26 Technologies',type:'Zoho Creator / CRM / Leaflet',description:'Turning CRM records into an interactive map. Find vendors by location, explore an area, and get the details that matter.',image:'projects/vendor-map.jpg',label:'LOCATION INTELLIGENCE',zoho:true},
  {slug:'lead-marketplace',name:'From lost lead to new possibility.',short:'Lead marketplace',org:'RG26 Technologies',type:'Zoho CRM / Flow / Creator',description:'A connected journey from eligible leads to priced listings and purchased-detail delivery.',image:'projects/lead-marketplace.png',label:'CONNECTED COMMERCE',zoho:true},
  {slug:'crm-automation',name:'Signed. Synced. Moving forward.',short:'Contract-to-CRM automation',org:'BritePH',type:'Zoho CRM / Deluge',description:'Connecting signed-document conditions with CRM deal updates through custom Deluge logic.',image:'projects/evidence-29.png',label:'WORKFLOW AUTOMATION',zoho:true},
  {slug:'partner-lookup',short:'Partner company lookup',type:'Zoho Creator / Sheet / Deluge',zoho:true},
  {slug:'sunrise-clock',short:'Sunrise clock widget',type:'Zoho Creator / JavaScript',zoho:true},
  {slug:'ai-resume-analyzer',short:'AI Resume Analyzer',type:'Zoho Creator / Recruit / OpenAI · Proposed application',zoho:true},
  {slug:'event-reporting',short:'Event reporting & team updates',type:'Zoho Creator / Flow / Cliq',zoho:true},
  {slug:'zoho-analytics',short:'Zoho Analytics reporting',type:'Zoho Analytics / Data visualization',zoho:true},
  {slug:'google-chat-reminders',short:'Google Chat reminder app',type:'Apps Script / Google Chat / Sheets',zoho:false},
  {slug:'call-quality',short:'Call quality evaluation',type:'Application workflow',zoho:false},
  {slug:'nomo-pos',short:'Nomo POS interface design',type:'Product design',zoho:false},
  {slug:'applicant-readiness',short:'Applicant readiness report',type:'Reporting workflow',zoho:false},
  {slug:'ringcentral-workflows',short:'RingCentral call workflows',type:'Contact center configuration',zoho:false},
  {slug:'blog-design',short:'BritePH blog design',type:'Web & content design',zoho:false},
];
const awards = [
 ['Digital Luminary','digital-luminary.jpg'],['Deluge Prodigy','deluge-prodigy.jpg'],['Codeless Crusader','codeless-crusader.jpg'],['Creator Extraordinaire','creator-extraordinaire.jpg']
];
const credentials = [
 {title:'EF SET English Certificate',meta:'EF SET · 2 October 2025',detail:'77/100 · C2 Proficient',img:'ef-set-english.png',logo:'ef-set.jpg'},
 {title:'On-the-Job Training Certificate',meta:'MSU–IIT · 17 June 2022',detail:'Office of Institutional Planning and Development Services',img:'ojt-completion-updated.png',logo:'msu-iit.jpg'},
 {title:'Getting Started with ReactJS Components',meta:'Simplilearn SkillUP · 24 October 2022',detail:'Course completion',img:'reactjs-components-clean.png',logo:'skillup.png'},
 {title:'Introduction to Cyber Security',meta:'Simplilearn SkillUP · 22 October 2022',detail:'Course completion',img:'intro-cyber-security.jpg',logo:'skillup.png'},
];
const systems = [
 {title:'Applications',text:'Custom Zoho interfaces built around the way people work.',project:'Vendor map',slug:'vendor-map'},
 {title:'Automation',text:'Less manual handover. More connected workflows.',project:'Contract-to-CRM automation',slug:'crm-automation'},
 {title:'Intelligence',text:'Making business data easier to understand and act on.',project:'Zoho Analytics reporting',slug:'zoho-analytics'},
];
type Preview = {src:string;title:string;meta:string};
type ProjectFact = [label:string,value:string];
const featuredFacts: Record<string,ProjectFact[]> = {
 'vendor-map': [
  ['Problem','CRM vendor records were difficult to explore by location.'],
  ['My role','Solutions developer · RG26 Technologies'],
  ['Build','A searchable Creator widget with Leaflet markers and CRM vendor details.'],
  ['Stack','Zoho Creator · CRM · Leaflet · JavaScript · Deluge'],
  ['Outcome','Explore an area and inspect nearby vendors in one interface.'],
 ],
 'lead-marketplace': [
  ['Problem','Eligible lost leads needed a route from CRM records to marketplace listings.'],
  ['My role','Solutions developer · RG26 Technologies'],
  ['Build','A connected workflow for pricing, location lookup, listings, and purchased-detail delivery.'],
  ['Stack','Zoho CRM · Flow · Creator · Webhooks'],
  ['Outcome','A lead can move from eligibility to a priced listing and buyer delivery.'],
 ],
 'crm-automation': [
  ['Problem','Signed-document status and CRM deal records required separate updates.'],
  ['My role','Developer at BritePH; project responsibilities not specified.'],
  ['Build','Signed-document conditions and Deluge logic for related deal and contract fields.'],
  ['Stack','Zoho CRM · Deluge'],
  ['Outcome','Intended to reduce repeated updates and keep pipeline information timely.'],
 ],
};
function ProjectFacts({slug}:{slug:string}) {
 return <dl className="project-facts" aria-label="Project overview">{featuredFacts[slug].map(([label,value])=><div className="project-fact" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
export default function Portfolio(){
 const [menu,setMenu]=useState(false),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(true),[failed,setFailed]=useState(false),[inView,setInView]=useState(true),[hidden,setHidden]=useState(false);
 const [activeSystem,setActiveSystem]=useState(0),[still,setStill]=useState(false),[sceneReady,setSceneReady]=useState(false),[sceneEnabled,setSceneEnabled]=useState(false),[smallScreen,setSmallScreen]=useState(true),[motionOptIn,setMotionOptIn]=useState(false);
 const showStill=still||failed||!sceneEnabled||((reduced||smallScreen)&&!motionOptIn);
 useEffect(()=>{const id=window.setTimeout(()=>{if(matchMedia('(min-width: 801px) and (prefers-reduced-motion: no-preference)').matches)setSceneEnabled(true)},300);return()=>clearTimeout(id)},[]);
 useEffect(()=>{if(showStill)setSceneReady(false)},[showStill]);
 const [filter,setFilter]=useState('all'),[preview,setPreview]=useState<Preview|null>(null),[copied,setCopied]=useState(false),[zoom,setZoom]=useState(false),[copyError,setCopyError]=useState(false);
 const dialog = useRef<HTMLDialogElement>(null), stage=useRef<HTMLDivElement>(null), trigger=useRef<HTMLElement|null>(null);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 800px)');const sync=()=>{setReduced(media.matches);setSmallScreen(mobile.matches)};sync();media.addEventListener('change',sync);mobile.addEventListener('change',sync);const visibility=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',visibility);return()=>{media.removeEventListener('change',sync);mobile.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility)}},[]);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{rootMargin:'100px'});if(stage.current)observer.observe(stage.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(el=>obs.observe(el));return()=>obs.disconnect()},[]);
 useEffect(()=>{if(preview){if(!dialog.current?.open)dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}}else {dialog.current?.close();trigger.current?.focus();setZoom(false)}},[preview]);
 useEffect(()=>{document.documentElement.dataset.motion=paused||showStill?'still':'full';return()=>{delete document.documentElement.dataset.motion}},[paused,showStill]);
 const open=(p:Preview,e:React.MouseEvent<HTMLElement>)=>{trigger.current=e.currentTarget;setZoom(false);setPreview(p)};
 const copy=async()=>{setCopyError(false);try{await navigator.clipboard.writeText(email);setCopied(true);setTimeout(()=>setCopied(false),2500)}catch{setCopied(false);setCopyError(true)}};
 const certificate=(c:typeof credentials[number])=><button className="certificate" key={c.title} onClick={e=>open({src:`credentials/${c.img}`,title:c.title,meta:c.meta},e)} aria-label={`Enlarge ${c.title}`}><span className="certificate-image"><img src={asset(`credentials/${c.img}`)} alt={`${c.title} preview`} loading="lazy"/></span><span className="certificate-info"><img src={asset(`logos/${c.logo}`)} alt="" width="38" height="38"/><span><small>{c.meta}</small><strong>{c.title}</strong><small>{c.detail}</small></span><ZoomIn size={18} aria-hidden="true"/></span></button>;
 return <>
 <a className="skip-link" href="#main">Skip to content</a><a className="skip-link skip-projects" href="#work">Skip to projects</a>
 <header className="navigation" onKeyDown={e=>{if(e.key==='Escape'){setMenu(false);document.getElementById('menu-toggle')?.focus()}}}><a className="brand" href="#top" aria-label="Ian Gutierrez home">ian<span>.</span></a><button className="menu-toggle" id="menu-toggle" aria-controls="main-nav" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><nav id="main-nav" className={menu?'nav-links is-open':'nav-links'} aria-label="Main navigation"><a href="#work" onClick={()=>setMenu(false)}>Work</a><a href="#about" onClick={()=>setMenu(false)}>About</a><a href="#recognition" onClick={()=>setMenu(false)}>Credentials</a><a className="nav-cta" href="#contact" onClick={()=>setMenu(false)}>Let’s talk <ArrowUpRight size={17}/></a></nav></header>
 <main id="main">
 <section className="hero wrap" id="top">
  <div className="hero-topline"><span>Ian Van Anthony Gutierrez</span><span>Solutions developer & project manager</span></div>
  <div className="hero-grid">
    <div className="hero-copy">
      <h1>Complex work.<br/><span>Connected.</span></h1>
      <p className="hero-services">Zoho applications, automation &amp; integrations</p>
      <p className="hero-intro">I build the applications and workflows that help your team turn business data into useful action.</p>
      <div className="hero-buttons"><a className="button dark" href="#work">Explore my work <ArrowDown size={18}/></a><a className="under-link" href="#contact">Let’s talk <ArrowUpRight size={18}/></a></div>
      <div className="system-explorer"><div className="system-controls" role="group" aria-label="Explore my capabilities">{systems.map((s,i)=><button key={s.title} aria-pressed={activeSystem===i} aria-controls="system-detail" onClick={()=>setActiveSystem(i)}>{s.title}</button>)}</div><div className="system-detail" id="system-detail" aria-live="polite"><p>{systems[activeSystem].text}</p><a href={asset('case-studies/'+systems[activeSystem].slug+'.html')}>{systems[activeSystem].project}<ArrowUpRight size={16}/></a></div></div>
    </div>
    <div className="engine" ref={stage} data-still={showStill} data-ready={sceneReady&&!showStill}>
      <div className="engine-fallback" aria-hidden="true"><span/><span/><span/></div>
      {!showStill&&<div className="canvas-wrap"><Scene activeIndex={activeSystem} paused={paused||!inView||hidden} onReady={()=>setSceneReady(true)} onFailure={()=>setFailed(true)}/></div>}
      <div className="engine-caption"><span>Separate parts.<br/><strong>One working system.</strong></span><div className="engine-actions"><button onClick={()=>{
        if(showStill){setMotionOptIn(true);setSceneEnabled(true);setStill(false);setPaused(false)}
        else{setStill(true);setMotionOptIn(false)}
      }} aria-label={showStill?'Enable 3D motion':'Show still artwork'} aria-pressed={!showStill} disabled={failed} title={failed?'Still artwork is available because 3D could not load':undefined}>{failed?'Still artwork':showStill?'Enable 3D':'Still artwork'}<Layers3 size={14}/></button>{!showStill&&<button onClick={()=>setPaused(!paused)} aria-label={paused?'Resume motion':'Pause motion'} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}<span>{paused?'Resume':'Pause'}</span></button>}</div></div>
    </div>
    <a className="hero-proof" href={asset('case-studies/vendor-map.html')}><span className="proof-intro">Vendor map<small>CRM records, searchable by location.</small></span><span className="proof-project"><img src={asset('projects/vendor-map.jpg')} alt="Vendor map showing CRM vendors by location" width="1024" height="641"/><span>View case study <ArrowUpRight size={18}/></span></span></a>
  </div>
  <div className="hero-foot"><span>Cagayan de Oro, Philippines</span><span>Applications <i/> Automation <i/> Intelligence</span><a href="#work" aria-label="Explore selected work"><ArrowDown size={18}/></a></div>
</section>
<section className="section wrap selected-work" id="work">
  <div className="work-intro"><h2>Selected work.<br/><span>Built around real needs.</span></h2><p>Location search, lead delivery, and contract updates—three ways I’ve worked with Zoho systems.</p></div>
  <article className="project-chapter map-chapter" aria-labelledby="map-title">
    <div className="project-title-row"><h3 id="map-title">A list tells you who.<br/><em>A map shows you where.</em></h3><a className="under-link" href={asset('case-studies/vendor-map.html')}>View case study <ArrowUpRight size={19}/></a></div>
    <div className="map-composition">
      <div className="map-evidence"><button className="evidence-media" onClick={e=>open({src:'projects/vendor-map.jpg',title:'Vendor map',meta:'Actual project interface · RG26 Technologies'},e)} aria-label="Enlarge screenshot: Vendor map"><img src={asset('projects/vendor-map.jpg')} alt="Zoho Creator vendor map with location search, vendor markers and record details" width="1024" height="641" loading="lazy"/><span className="image-zoom"><ZoomIn size={17}/> Enlarge screenshot</span></button><p className="evidence-caption">Vendor map · RG26 Technologies<span>Actual project interface</span></p></div>
      <div className="project-story"><ProjectFacts slug="vendor-map"/><p className="project-evidence">Project interface; outcomes not quantified.</p></div>
    </div>
    <div className="project-takeaway"><span>Records</span><ArrowRight size={18}/><span>Geographic context</span><ArrowRight size={18}/><strong>A useful interface.</strong></div>
  </article>
  <article className="project-chapter marketplace-chapter" aria-labelledby="market-title">
    <div className="project-title-row marketplace-heading"><h3 id="market-title">A lost lead.<br/><em>A new route forward.</em></h3><a className="under-link" href={asset('case-studies/lead-marketplace.html')}>View case study <ArrowUpRight size={18}/></a></div>
    <div className="marketplace-composition">
      <figure className="marketplace-evidence">
        <button className="evidence-media flow-evidence" onClick={e=>open({src:'projects/lead-marketplace.png',title:'Lead marketplace workflow',meta:'Actual Zoho Flow configuration · RG26 Technologies'},e)} aria-label="Enlarge screenshot: Lead marketplace workflow"><img src={asset('projects/lead-marketplace.png')} alt="Zoho Flow configuration connecting webhook input, pricing, location and Creator record creation" width="737" height="508" loading="lazy"/><span className="image-zoom"><ZoomIn size={17}/> Enlarge screenshot</span></button>
        <figcaption className="marketplace-caption">Actual Zoho Flow configuration: webhook, pricing, location lookup and record creation. The steps below illustrate the documented journey.<span>Workflow configuration; sales impact not measured.</span></figcaption>
      </figure>
      <div className="marketplace-context"><ProjectFacts slug="lead-marketplace"/></div>
    </div>
    <ol className="lead-route" aria-label="Documented marketplace workflow"><li><span>01</span><strong>Eligible lead</strong><p>A designated lost-lead status starts the workflow.</p><ArrowRight size={21}/></li><li><span>02</span><strong>Price & location</strong><p>Flow derives the listing price and retrieves location data.</p><ArrowRight size={21}/></li><li><span>03</span><strong>Marketplace listing</strong><p>Creator makes the record available for browsing.</p><ArrowRight size={21}/></li><li><span>04</span><strong>Buyer delivery</strong><p>Purchased lead details are delivered by email.</p></li></ol>
  </article>
  <article className="project-chapter contract-chapter" aria-labelledby="contract-title">
    <div className="contract-heading"><h3 id="contract-title">The document is signed.<br/><em>The system should know.</em></h3><a className="under-link" href={asset('case-studies/crm-automation.html')}>View case study <ArrowUpRight size={18}/></a></div>
    <div className="contract-sequence" aria-label="Illustration of the shown automation configuration"><div><span>Document</span><strong>Signed</strong><small>Signed-status condition</small></div><ArrowRight size={26}/><div className="logic-step"><Workflow size={26}/><strong>Deluge checks</strong><small>Related document status</small></div><ArrowRight size={26}/><div><span>CRM deal</span><strong>Closed Won</strong><small>Contract Signed</small></div></div>
    <div className="contract-detail"><div><ProjectFacts slug="crm-automation"/><p className="project-evidence">Workflow configuration and partial code; impact not measured. Illustrated sequence.</p></div><button className="evidence-media contract-evidence" onClick={e=>open({src:'projects/evidence-29.png',title:'Contract-to-CRM automation',meta:'Signed-document workflow configuration · BritePH'},e)} aria-label="Enlarge screenshot: Contract-to-CRM automation"><img src={asset('projects/evidence-29.png')} alt="Zoho signed-document condition with immediate CRM field-update actions" width="1919" height="891" loading="lazy"/><span className="image-zoom"><ZoomIn size={17}/> Enlarge screenshot</span></button></div>
  </article>
  <details className="project-index"><summary><span>Explore 11 more projects</span><Plus className="expand-icon" size={22}/></summary><div className="index-heading"><div className="filter-controls" aria-label="Filter projects">{[['all','All work'],['zoho','Zoho'],['other','Beyond Zoho']].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} aria-pressed={filter===v}>{l}</button>)}</div></div><div className="archive-list" aria-live="polite">{projects.slice(3).filter(p=>filter==='all'||(filter==='zoho'?p.zoho:!p.zoho)).map(p=><a className="archive-row" href={asset(`case-studies/${p.slug}.html`)} key={p.slug}><span>{String(projects.indexOf(p)+1).padStart(2,'0')}</span><strong>{p.short}</strong><span>{p.type}</span><ArrowUpRight size={21}/></a>)}</div></details></section>
 <ConnectionStory paused={paused} reduced={reduced} still={showStill}/>
 <section className="section wrap about" id="about"><div className="section-marker" aria-hidden="true"/><div className="about-layout"><div className="about-image" data-reveal><img src={asset('ian-about-portrait.png')} alt="Ian Van Anthony Gutierrez" width="1024" height="1536" loading="lazy"/><div className="photo-caption"><span>IAN GUTIERREZ</span><span>DEVELOPER. DESIGNER. CONNECTOR.</span></div></div><div className="about-copy" data-reveal><h2>Behind every connection,<br/><span>a person who listens.</span></h2><p>I’m Ian Van Anthony Gutierrez, a solutions developer and technology project manager based in the Philippines.</p><p>I work with stakeholders and technical teams to turn requirements into useful applications. My work spans custom systems, interface design, documentation, onboarding, and support.</p><p>I begin with the people using the system and stay involved in helping them use it.</p><a className="under-link" href={linkedIn} target="_blank" rel="noopener noreferrer">Connect on LinkedIn <ArrowUpRight size={18}/></a></div></div>
 <div className="experience-list"><h3>Where I’ve built.</h3><p className="latest-role-summary">Most recently at RG26 Technologies, I developed Zoho Creator applications and integrated Zoho One systems, while managing requirements, onboarding, documentation, and operational IT support.</p>{[
 {dates:'JUL 2023 — JUN 2026',company:'RG26 Technologies',role:'Solutions Developer · Technology & Project Management',logo:'rg26.jpg',points:['Developed and managed Zoho Creator applications and integrated Zoho One systems.','Built an AI application with Zoho Creator and OpenAI; contributed to the company achieving Zoho Partner status.','Delivered application features, analytics dashboards, Figma interfaces, and Google Workspace tools.','Managed requirements, user access, onboarding, documentation, and operational IT support.']},
 {dates:'JUN 2022 — JUN 2023',company:'BritePH Design and Automation',role:'Developer',logo:'briteph.jpg',points:['Designed interfaces in Figma and Adobe XD; built frontends with React, TypeScript, HTML, CSS, and Tailwind CSS.','Built and maintained websites using WordPress, System.io, Duda, and Zoho Sites.','Supported Zoho CRM, Campaigns, Analytics, Flow, Writer, and WorkDrive workflows.','Prepared reporting data, automated processes with Zapier, and created project documentation.']},
 {dates:'JAN — MAY 2022',company:'MSU–IIT OVCPD',role:'Data Analyst & DBA Intern',logo:'msu-iit.jpg',points:['Designed an entity relationship diagram for the university’s major final outputs website.','Developed an office website with Google Sites and KPI reports in Excel and Google Sheets.','Analyzed university outputs, prepared presentations, and supported project handover.']}
 ].map(e=><details key={e.company}><summary><span className="eyebrow">{e.dates}</span><span className="role-company"><img src={asset(`logos/${e.logo}`)} alt="" width="36" height="36"/><span><strong>{e.company}</strong><small>{e.role}</small></span></span><Plus className="expand-icon" size={22}/></summary><ul>{e.points.map(t=><li key={t}>{t}</li>)}</ul></details>)}</div>
 <details className="toolkit"><summary><span>Tools of the trade</span><Plus className="expand-icon"/></summary><div>{[['Zoho & automation','Zoho One · Creator · Deluge · CRM · Analytics · Campaigns · Flow · Desk · Projects · Zapier · OpenAI integrations'],['Development & data','React · JavaScript · TypeScript · HTML · CSS · Tailwind CSS · Java · Python · PHP · SQL · MySQL · MongoDB · GitHub'],['Design & delivery','Figma · Adobe XD · WordPress · Duda · Google Workspace · Microsoft 365 · Project management · Technical documentation']].map(([t,d])=><section key={t}><h4>{t}</h4><p>{d}</p></section>)}</div></details>
 </section>
 <section className="education-section education-compact" id="background"><div className="wrap education-layout"><div className="education-heading" data-reveal><h2>Education.</h2></div><img className="education-portrait" src={asset('ian-education-portrait.png')} alt="Ian in MSU–IIT graduation attire" width="1086" height="1448" loading="lazy"/><div className="education-detail"><img src={asset('logos/msu-iit.jpg')} alt="MSU–IIT logo" width="50" height="50" loading="lazy"/><span className="eyebrow">2018 — 2022</span><h3>BS Information Technology</h3><p>Major in Databases<br/>Mindanao State University – Iligan Institute of Technology</p><span className="honor">Cum laude</span><details><summary>More background <Plus size={15}/></summary><p>ROTC Cadet. Previously a Hazard Engineer Assistant at UKC Builders Inc during work immersion, March–June 2017.</p><p>English · Filipino · Bisaya<br/>Basic Japanese / Nihongo</p></details></div></div></section>
 <section className="section wrap recognition" id="recognition"><div className="section-marker" aria-hidden="true"/><div className="section-head" data-reveal><h2>Recognized by<br/><span>Zoho Creator.</span></h2><p>Four recognitions from Zoho Creator Developers’ Month 2023.</p></div><div className="award-grid">{awards.map(([title,img])=><button className="award" key={title} onClick={e=>open({src:`credentials/${img}`,title,meta:'Zoho Creator · Developers’ Month 2023'},e)} aria-label={`Enlarge ${title} recognition`}><span className="award-top"><img src={asset('logos/zoho.jpg')} alt="Zoho" width="28" height="28"/><span>2023</span></span><span className="award-art"><img src={asset(`credentials/${img}`)} alt="" width="1430" height="885" loading="lazy"/></span><span className="award-title">{title}</span><span className="award-bottom">ZOHO CREATOR <ZoomIn size={17} aria-hidden="true"/></span></button>)}</div><div className="certificates-heading"><h3>Selected credentials</h3></div><div className="certificates-grid">{credentials.slice(0,2).map(certificate)}</div><details className="course-disclosure"><summary><span>Earlier course completions · 2022</span><Plus className="expand-icon" size={22}/></summary><div className="certificates-grid credential-archive">{credentials.slice(2).map(certificate)}</div></details><button className="under-link internship-link" onClick={e=>open({src:'credentials/internship-completion-photo.jpg',title:'Internship completion photo',meta:'MSU–IIT · 2022'},e)}>Enlarge internship completion photo <ZoomIn size={17}/></button></section>
 <section className="contact" id="contact"><div className="wrap"><div className="section-marker" aria-hidden="true"/><div className="contact-heading" data-reveal><div className="closing-copy"><div className="closing-connections" aria-hidden="true"><span/><span/><span/></div><h2>Let’s make your<br/>systems <em>work together.</em></h2></div><a className="button dark contact-email" href={`mailto:${email}`}>Email Ian <ArrowUpRight size={20}/></a></div><div className="contact-bottom"><div><p>Tell me what your team needs.<br/>Let’s find a useful next step.</p><a className="email" href={`mailto:${email}`}>{email}</a><button className="copy" onClick={copy} aria-label="Copy email address">{copied?<Check size={17}/>:<Copy size={17}/>}</button><span className="copy-status" role="status" aria-live="polite">{copied?'Email copied':copyError?'Copy unavailable. Please use the email link.':''}</span></div><div className="socials"><a href={linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={18}/></a><a href="tel:+639709584212">+63 970 958 4212 <ArrowUpRight size={18}/></a><span>Cagayan de Oro, Philippines</span></div></div></div></section>
 </main><footer className="footer wrap"><a className="brand" href="#top" aria-label="Back to top">ian<span>.</span></a><span>© {new Date().getFullYear()} IAN VAN ANTHONY GUTIERREZ</span><nav aria-label="Footer navigation"><a href={asset('terms.html')}>Terms</a><a href={asset('privacy.html')}>Privacy</a><a href="#top">Back to top <ArrowUpRight size={14}/></a></nav></footer>
 <dialog ref={dialog} aria-labelledby="preview-title" className={zoom?"preview-dialog zoomed":"preview-dialog"} onCancel={e=>{e.preventDefault();setPreview(null)}} onClick={e=>{if(e.target===e.currentTarget)setPreview(null)}}>{preview&&<div className="preview-content"><header><div><small>{preview.meta}</small><h2 id="preview-title">{preview.title}</h2></div><button aria-label={zoom?"Fit image":"Zoom image"} onClick={()=>setZoom(!zoom)}>{zoom?<ZoomOut/>:<ZoomIn/>}</button><button aria-label="Close image preview" onClick={()=>setPreview(null)}><X/></button></header><div className="preview-image-scroll"><img src={asset(preview.src)} alt={preview.title}/></div><a href={asset(preview.src)} target="_blank" rel="noopener noreferrer">Open full-size image <ArrowUpRight size={16}/></a></div>}</dialog>
 </>;
}
