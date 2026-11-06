import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BadgeCheck,
  BarChart3, Bell, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleHelp, ClipboardList, Eye, FilePlus2, Filter, Flag, Globe2, LayoutDashboard,
  Menu, MessageSquareText, MoreHorizontal, Plus, Search, Shield, ShieldCheck,
  SlidersHorizontal, Sparkles, Trash2, TrendingUp, X, XCircle
} from "lucide-react";

const API = "http://localhost:3001";
const categories = ["Forced action", "Interface interference", "Nagging", "Obstruction", "Sneaking", "Social proof manipulation", "Urgency / scarcity"];
const statuses = ["Pending review", "Under review", "Published", "Needs more evidence", "Not substantiated"];
const severityOptions = ["Low", "Medium", "High"];

const seedFallback = {
  reports: [
    { id: 1, platformId: 1, platform: "Streamly", title: "Cancellation takes several screens", category: "Obstruction", description: "The cancellation route is difficult to locate and requires several confirmation screens. The user is repeatedly prompted to keep the subscription.", evidence: "https://example.com/evidence/cancel-flow", submittedBy: "Community report", date: "2026-10-28", status: "Published", severity: "High", reviewerNote: "The submitted journey shows repeated retention prompts. Published as a documented user experience, not a legal finding." },
    { id: 2, platformId: 2, platform: "Cartwise", title: "Add-on appears preselected at checkout", category: "Sneaking", description: "An optional protection add-on appeared selected by default during checkout. The selection was not obvious in the order summary.", evidence: "https://example.com/evidence/checkout", submittedBy: "Community report", date: "2026-10-30", status: "Under review", severity: "Medium", reviewerNote: "" },
    { id: 3, platformId: 3, platform: "FitHabit", title: "Repeated prompts after declining trial", category: "Nagging", description: "The app repeatedly displays prompts to start a free trial after the user chooses to continue with the free version.", evidence: "", submittedBy: "Community report", date: "2026-11-01", status: "Pending review", severity: "Low", reviewerNote: "" },
    { id: 4, platformId: 1, platform: "Streamly", title: "Renewal price is hard to notice", category: "Interface interference", description: "The renewal amount is visually less prominent than the introductory offer. More evidence is needed to understand the full journey.", evidence: "", submittedBy: "Community report", date: "2026-11-02", status: "Needs more evidence", severity: "Medium", reviewerNote: "Request a screenshot of the final confirmation step." }
  ],
  platforms: [
    { id: 1, name: "Streamly", type: "Subscription service", website: "streamly.example" },
    { id: 2, name: "Cartwise", type: "E-commerce", website: "cartwise.example" },
    { id: 3, name: "FitHabit", type: "Mobile application", website: "fithabit.example" }
  ],
  findings: [
    { id: 1, reportId: 1, platform: "Streamly", title: "Difficult cancellation journey", category: "Obstruction", severity: "High", status: "Published", date: "2026-10-29" }
  ],
  responses: [
    { id: 1, reportId: 1, platform: "Streamly", message: "We are reviewing the cancellation flow and will provide an update.", status: "Acknowledged", date: "2026-10-31" }
  ]
};

function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const response = await fetch(`${API}/${name}`);
      if (!response.ok) throw new Error("Could not connect to JSON Server.");
      setItems(await response.json());
      setError("");
    } catch (e) {
      setError("Can't reach the local database. Start the app using: npm start");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [name]);
  const create = async (item) => {
    const response = await fetch(`${API}/${name}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    if (!response.ok) throw new Error("Create failed");
    const saved = await response.json();
    setItems(prev => [saved, ...prev]);
    return saved;
  };
  const update = async (id, changes) => {
    const response = await fetch(`${API}/${name}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
    if (!response.ok) throw new Error("Update failed");
    const saved = await response.json();
    setItems(prev => prev.map(x => String(x.id) === String(id) ? saved : x));
    return saved;
  };
  const remove = async (id) => {
    const response = await fetch(`${API}/${name}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Delete failed");
    setItems(prev => prev.filter(x => String(x.id) !== String(id)));
  };
  return { items, loading, error, reload: load, create, update, remove };
}

const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "WORKSPACE" },
  { id: "library", label: "Transparency library", icon: BookOpen, group: "WORKSPACE" },
  { id: "submit", label: "Submit a report", icon: FilePlus2, group: "WORKSPACE" },
  { id: "review", label: "Investigation desk", icon: ShieldCheck, group: "RESEARCH" },
  { id: "accountability", label: "Accountability", icon: ClipboardList, group: "RESEARCH" }
];

function Tag({ children, tone = "neutral" }) { return <span className={`tag ${tone}`}>{children}</span>; }
function statusTone(status) {
  if (status === "Published" || status === "Verified") return "green";
  if (status === "Pending review" || status === "Needs more evidence") return "amber";
  if (status === "Not substantiated") return "red";
  return "blue";
}
function severityTone(severity) { return severity === "High" ? "red" : severity === "Medium" ? "amber" : "green"; }
function initials(name = "PW") { return name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase(); }

function App() {
  const reports = useCollection("reports");
  const platforms = useCollection("platforms");
  const findings = useCollection("findings");
  const responses = useCollection("responses");
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 3000); };
  const allError = reports.error || platforms.error || findings.error || responses.error;
  const published = reports.items.filter(r => r.status === "Published");
  const filteredReports = useMemo(() => reports.items.filter(r => {
    const term = query.toLowerCase();
    const matchesText = [r.title, r.platform, r.category, r.description].join(" ").toLowerCase().includes(term);
    return matchesText && (categoryFilter === "All categories" || r.category === categoryFilter) && (statusFilter === "All statuses" || r.status === statusFilter);
  }), [reports.items, query, categoryFilter, statusFilter]);

  const submitReport = async (data) => {
    const platformName = data.platform.trim();
    let platform = platforms.items.find(p => p.name.toLowerCase() === platformName.toLowerCase());
    if (!platform) platform = await platforms.create({ name: platformName, type: data.platformType || "Website", website: data.website || "" });
    await reports.create({
      platformId: platform.id, platform: platform.name, title: data.title.trim(), category: data.category,
      description: data.description.trim(), evidence: data.evidence.trim(), submittedBy: "Community report",
      date: new Date().toISOString().slice(0, 10), status: "Pending review", severity: "Not assessed", reviewerNote: ""
    });
    setPage("library");
    notify("Your report has been submitted for review.");
  };

  const changeStatus = async (report, status) => {
    await reports.update(report.id, { status });
    if (status === "Published" && !findings.items.some(f => String(f.reportId) === String(report.id))) {
      await findings.create({ reportId: report.id, platform: report.platform, title: report.title, category: report.category, severity: report.severity === "Not assessed" ? "Medium" : report.severity, status: "Published", date: new Date().toISOString().slice(0, 10) });
    }
    notify(`Report moved to ${status.toLowerCase()}.`);
  };

  const contentProps = { reports, platforms, findings, responses, notify, submitReport, changeStatus, filteredReports, query, setQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter };

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Shield size={19}/></div><div><strong>patternwatch<span>.</span></strong><small>INDEPENDENT DIGITAL ACCOUNTABILITY</small></div></div>
      <div className="workspace-label">YOUR WORKSPACE <ChevronDown size={13}/></div>
      <div className="profile-switch"><div className="avatar">PW</div><div><b>PatternWatch Lab</b><small>Community workspace</small></div><MoreHorizontal size={17}/></div>
      {["WORKSPACE", "RESEARCH"].map(group => <div className="nav-group" key={group}><div className="nav-heading">{group}</div>{nav.filter(n => n.group === group).map(item => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setSidebarOpen(false); }}><item.icon size={17}/><span>{item.label}</span>{item.id === "review" && reports.items.filter(r => r.status === "Pending review").length > 0 && <i>{reports.items.filter(r => r.status === "Pending review").length}</i>}</button>)}</div>)}
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={17}/><div><b>Need a hand?</b><small>Learn how reports are reviewed.</small></div><ChevronRight size={15}/></div><div className="user-row"><div className="avatar user">ML</div><div><b>Researcher account</b><small>Local demo mode</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}
    <main className="main">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{nav.find(n => n.id === page)?.label || "Overview"}</b></div><div className="top-actions"><span className="live-dot"/> <span className="demo-label">DEMO ENVIRONMENT</span><button className="icon-button" title="Notifications"><Bell size={17}/></button><div className="avatar user">ML</div></div></header>
      <div className="page-wrap">
        {allError && <div className="db-alert"><AlertTriangle size={17}/><span>{allError}</span></div>}
        {page === "overview" && <Overview {...contentProps} setPage={setPage}/>}
        {page === "library" && <Library {...contentProps}/>}
        {page === "submit" && <SubmitPage {...contentProps}/>}
        {page === "review" && <ReviewDesk {...contentProps}/>}
        {page === "accountability" && <Accountability {...contentProps}/>}
      </div>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Overview({ reports, findings, responses, setPage }) {
  const total = reports.items.length;
  const pending = reports.items.filter(r => ["Pending review", "Under review", "Needs more evidence"].includes(r.status)).length;
  const addressed = responses.items.filter(r => r.status === "Resolved").length;
  const countByCategory = categories.map(c => ({ name: c, count: reports.items.filter(r => r.category === c).length })).filter(x => x.count).sort((a,b) => b.count-a.count);
  return <><PageHeading eyebrow="TUESDAY, 03 NOVEMBER 2026 / WORKSPACE" title="A clearer view of digital choices." description="Track reported design concerns, review evidence and follow the path to accountability." action={<button className="button primary" onClick={() => setPage("submit")}><Plus size={16}/> New report</button>}/>
    <div className="welcome-banner"><div><Tag tone="outline">THE ACCOUNTABILITY LOOP</Tag><h2>Make the invisible<br/><em>visible.</em></h2><p>PatternWatch turns individual digital experiences into structured, reviewable evidence.</p><button className="text-button light" onClick={() => setPage("library")}>Explore the transparency library <ArrowUpRight size={15}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><ShieldCheck size={42}/></div><div className="orbit-node node-a"><Eye size={17}/></div><div className="orbit-node node-b"><Flag size={17}/></div><div className="orbit-node node-c"><BadgeCheck size={17}/></div></div><div className="banner-index">PW / 001</div></div>
    <div className="section-row"><div><h2>Workspace pulse</h2><p>Snapshot of activity across the platform</p></div><span className="muted tiny">SAMPLE DATA · LOCAL DEMO</span></div>
    <div className="stats-grid">
      <Stat icon={FilePlus2} label="Total reports" value={total} note="Community submissions" trend="Live count"/>
      <Stat icon={Search} label="Awaiting review" value={pending} note="Needs researcher attention" trend="Review queue"/>
      <Stat icon={BadgeCheck} label="Published findings" value={findings.items.length} note="Reviewed and made public" trend="Evidence-led"/>
      <Stat icon={CheckCircle2} label="Resolved responses" value={addressed} note="Documented improvements" trend="Follow-through"/>
    </div>
    <div className="overview-grid"><section className="panel"><div className="panel-heading"><div><h3>Recent reports</h3><p>Latest community experiences</p></div><button className="text-button" onClick={() => setPage("library")}>View library <ArrowUpRight size={14}/></button></div><div className="report-list">{reports.items.slice(0,4).map(r => <ReportRow key={r.id} report={r}/>)}</div></section>
      <section className="panel"><div className="panel-heading"><div><h3>Reported patterns</h3><p>Distribution by category</p></div><BarChart3 size={18} className="muted"/></div>{countByCategory.length ? <div className="category-bars">{countByCategory.map((c,i) => <div className="bar-item" key={c.name}><div className="bar-label"><span>{c.name}</span><b>{c.count}</b></div><div className="bar-track"><div className="bar-fill" style={{width:`${Math.max(10,c.count/Math.max(...countByCategory.map(x=>x.count))*100)}%`}}/></div></div>)}</div> : <Empty text="Category activity will appear here."/>}<div className="note-box"><ShieldCheck size={17}/><span>Counts reflect this demo database, not the prevalence of practices across the internet.</span></div></section></div>
    <div className="bottom-note"><Sparkles size={16}/><span><b>Built around evidence, not accusations.</b> Reports are submissions until reviewed. A published finding is not a legal determination.</span></div>
  </>;
}
function Stat({ icon: Icon, label, value, note, trend }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17}/></div></div><div className="stat-value">{value}</div><div className="stat-foot"><span>{note}</span><Tag>{trend}</Tag></div></div>; }
function ReportRow({ report }) { return <div className="report-row"><div className="platform-avatar">{initials(report.platform)}</div><div className="report-row-main"><b>{report.title}</b><span>{report.platform} <i>·</i> {report.category}</span></div><div className="report-row-end"><Tag tone={statusTone(report.status)}>{report.status}</Tag><small>{report.date}</small></div></div>; }
function Empty({ text }) { return <div className="empty"><div className="empty-icon"><ClipboardList size={21}/></div><b>Nothing here yet</b><span>{text}</span></div>; }

function Library({ reports, filteredReports, query, setQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter }) {
  return <><PageHeading eyebrow="PUBLIC KNOWLEDGE BASE" title="Transparency library" description="Explore reported digital experiences and reviewed findings. Check the evidence and review status before drawing conclusions." action={<div className="library-count"><b>{reports.items.length}</b><span>total reports</span></div>}/>
    <div className="filter-panel"><div className="search-field"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platforms, reports or patterns..."/>{query && <button onClick={()=>setQuery("")}><X size={15}/></button>}</div><div className="filter-select"><Filter size={15}/><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option>All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div className="filter-select"><SlidersHorizontal size={15}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div></div>
    <div className="results-line"><span>SHOWING <b>{filteredReports.length}</b> OF {reports.items.length} REPORTS</span><span>Newest first</span></div>
    <div className="library-grid">{filteredReports.map(r=><LibraryCard key={r.id} report={r}/>)}</div>
    {!filteredReports.length && <Empty text="Try changing your search or filters."/>}
    <div className="disclaimer"><AlertTriangle size={16}/><span><b>Read responsibly.</b> Community reports may be incomplete or disputed. Published means reviewed by this demo's research workflow; it does not mean a regulator or court has found a violation.</span></div>
  </>;
}
function LibraryCard({ report }) { return <article className="library-card"><div className="card-meta"><Tag tone={statusTone(report.status)}>{report.status}</Tag><span>{report.date}</span></div><div className="platform-line"><div className="platform-avatar">{initials(report.platform)}</div><div><b>{report.platform}</b><small>Digital platform</small></div></div><h3>{report.title}</h3><p>{report.description}</p><div className="card-bottom"><Tag>{report.category}</Tag><span className="read-link">Case details <ChevronRight size={14}/></span></div></article>; }

function SubmitPage({ submitReport, platforms }) {
  const [form, setForm] = useState({ platform:"", platformType:"Website", website:"", title:"", category:categories[0], impact:"Yes", description:"", evidence:"" });
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const set = (key,value) => setForm(prev=>({...prev,[key]:value}));
  const submit = async (e) => { e.preventDefault(); setError(""); setBusy(true); try { await submitReport(form); setForm({platform:"",platformType:"Website",website:"",title:"",category:categories[0],impact:"Yes",description:"",evidence:""}); } catch { setError("The report could not be saved. Check that the database is running."); } finally { setBusy(false); } };
  return <><PageHeading eyebrow="COMMUNITY CONTRIBUTIONS" title="Report an experience." description="Help document a digital interaction that may make it harder for people to make informed choices."/>
    <div className="form-layout"><form className="panel report-form" onSubmit={submit}><div className="form-section-title"><span>01</span><div><h3>Where did it happen?</h3><p>Identify the website, app or digital service.</p></div></div><div className="form-grid"><Field label="Platform or company name" required><input required value={form.platform} onChange={e=>set("platform",e.target.value)} placeholder="e.g. Example Store"/></Field><Field label="Platform type"><select value={form.platformType} onChange={e=>set("platformType",e.target.value)}><option>Website</option><option>Mobile application</option><option>Subscription service</option><option>E-commerce</option><option>Other</option></select></Field><Field label="Website address (optional)" wide><input value={form.website} onChange={e=>set("website",e.target.value)} placeholder="https://example.com"/></Field></div><div className="form-divider"/><div className="form-section-title"><span>02</span><div><h3>Describe what happened</h3><p>Focus on what you experienced. Avoid assumptions about intent.</p></div></div><div className="form-grid"><Field label="Report title" wide required><input required maxLength="90" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Give this experience a short, clear title"/></Field><Field label="Potential pattern" wide><select value={form.category} onChange={e=>set("category",e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></Field><div className="field wide"><span>Did this affect a purchase, payment or subscription?</span><div className="radio-line"><label><input type="radio" name="impact" value="Yes" checked={form.impact==="Yes"} onChange={e=>set("impact",e.target.value)}/> Yes</label><label><input type="radio" name="impact" value="No" checked={form.impact==="No"} onChange={e=>set("impact",e.target.value)}/> No</label><label><input type="radio" name="impact" value="Not sure" checked={form.impact==="Not sure"} onChange={e=>set("impact",e.target.value)}/> Not sure</label></div></div><Field label="What happened?" wide required><textarea required minLength="20" rows="5" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What were you trying to do? What did the interface show? What made the choice difficult or unclear?"/></Field><Field label="Evidence link (optional)" wide><input value={form.evidence} onChange={e=>set("evidence",e.target.value)} placeholder="Link to a screenshot or supporting material"/></Field></div>{error&&<div className="form-error"><AlertTriangle size={15}/>{error}</div>}<div className="form-footer"><span><Shield size={15}/> Submissions enter review before publication.</span><button className="button primary" disabled={busy}>{busy?"Submitting...":"Submit report"} <ArrowUpRight size={15}/></button></div></form>
      <aside className="form-aside"><div className="aside-card dark"><div className="aside-icon"><ShieldCheck size={20}/></div><h3>Evidence over assumptions.</h3><p>A clear description and supporting screenshot help reviewers understand the experience.</p><div className="aside-rule"/><b>Before you submit</b><ul><li>Describe the steps you took.</li><li>Include relevant screenshots if possible.</li><li>Remove personal or payment information.</li><li>Don't submit passwords or private account data.</li></ul></div><div className="aside-card"><h3>What happens next?</h3><div className="mini-step"><i>1</i><span><b>Submitted</b><small>Your report enters the review queue.</small></span></div><div className="mini-step"><i>2</i><span><b>Reviewed</b><small>A reviewer checks the description and evidence.</small></span></div><div className="mini-step"><i>3</i><span><b>Published or updated</b><small>The status and review notes are recorded.</small></span></div></div></aside></div>
  </>;
}
function Field({ label, required, wide, children }) { return <label className={`field ${wide?"wide":""}`}><span>{label}{required&&<em> *</em>}</span>{children}</label>; }

function ReviewDesk({ reports, changeStatus, notify }) {
  const [selected,setSelected] = useState(null);
  const [severity,setSeverity] = useState("Medium");
  const [note,setNote] = useState("");
  const [edit,setEdit] = useState(null);
  const [editForm,setEditForm] = useState({});
  const [filter,setFilter] = useState("All");
  const queue = reports.items.filter(r => filter === "All" || r.status === filter);
  const startReview = (r) => { setSelected(r); setSeverity(r.severity === "Not assessed" ? "Medium" : r.severity); setNote(r.reviewerNote || ""); };
  const saveReview = async (status) => { try { await reports.update(selected.id,{status,severity,reviewerNote:note}); if(status==="Published") await changeStatus({...selected,severity},status); else notify(`Review saved: ${status}.`); setSelected(null); } catch { notify("Could not save review."); } };
  const beginEdit = (r) => { setEdit(r); setEditForm({title:r.title,description:r.description,category:r.category}); };
  const saveEdit = async () => { await reports.update(edit.id,editForm); setEdit(null); notify("Report details updated."); };
  const deleteReport = async (r) => { if(window.confirm("Delete this report permanently?")) { await reports.remove(r.id); notify("Report deleted."); } };
  return <><PageHeading eyebrow="RESEARCH WORKSPACE" title="Investigation desk" description="Review incoming reports, assess the evidence and record a transparent decision." action={<div className="queue-chip"><span className="live-dot"/>{reports.items.filter(r=>r.status==="Pending review").length} awaiting review</div>}/>
    <div className="review-toolbar"><div className="tabs">{["All","Pending review","Under review","Needs more evidence","Published","Not substantiated"].map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)}>{s}</button>)}</div></div>
    <div className="panel table-panel"><div className="table-head"><span>REPORT / PLATFORM</span><span>CATEGORY</span><span>SEVERITY</span><span>STATUS</span><span>ACTIONS</span></div>{queue.map(r=><div className="table-row" key={r.id}><div className="case-cell"><div className="platform-avatar">{initials(r.platform)}</div><div><b>{r.title}</b><small>{r.platform} · {r.date}</small></div></div><div><Tag>{r.category}</Tag></div><div>{r.severity==="Not assessed"?<span className="muted">Unassessed</span>:<Tag tone={severityTone(r.severity)}>{r.severity}</Tag>}</div><div><Tag tone={statusTone(r.status)}>{r.status}</Tag></div><div className="row-actions"><button title="Review" onClick={()=>startReview(r)}><Eye size={15}/></button><button title="Edit" onClick={()=>beginEdit(r)}><MoreHorizontal size={16}/></button><button title="Delete" onClick={()=>deleteReport(r)}><Trash2 size={15}/></button></div></div>)}{!queue.length&&<Empty text="No reports match this queue."/>}</div>
    {selected&&<Modal title="Review report" close={()=>setSelected(null)}><div className="review-detail"><Tag tone={statusTone(selected.status)}>{selected.status}</Tag><h3>{selected.title}</h3><p className="muted">{selected.platform} · {selected.category} · Submitted {selected.date}</p><p>{selected.description}</p>{selected.evidence&&<a href={selected.evidence} target="_blank" rel="noreferrer" className="evidence-link"><Eye size={15}/> Open evidence link <ArrowUpRight size={14}/></a>}<Field label="Assessment severity"><select value={severity} onChange={e=>setSeverity(e.target.value)}>{severityOptions.map(s=><option key={s}>{s}</option>)}</select></Field><Field label="Reviewer note"><textarea rows="3" value={note} onChange={e=>setNote(e.target.value)} placeholder="Explain the evidence, uncertainty or reason for your decision..."/></Field><div className="modal-actions"><button className="button subtle" onClick={()=>saveReview("Needs more evidence")}>Request evidence</button><button className="button subtle" onClick={()=>saveReview("Not substantiated")}>Not substantiated</button><button className="button primary" onClick={()=>saveReview("Published")}>Publish finding <Check size={15}/></button></div></div></Modal>}
    {edit&&<Modal title="Edit report" close={()=>setEdit(null)}><div className="review-detail"><Field label="Title"><input value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})}/></Field><Field label="Category"><select value={editForm.category} onChange={e=>setEditForm({...editForm,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Description"><textarea rows="4" value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})}/></Field><div className="modal-actions"><button className="button subtle" onClick={()=>setEdit(null)}>Cancel</button><button className="button primary" onClick={saveEdit}>Save changes</button></div></div></Modal>}
  </>;
}
function Modal({ title, close, children }) { return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><div className="modal"><div className="modal-header"><h3>{title}</h3><button className="icon-button" onClick={close}><X size={18}/></button></div>{children}</div></div>; }

function Accountability({ reports, responses, notify }) {
  const [reportId,setReportId] = useState("");
  const [platform,setPlatform] = useState("");
  const [message,setMessage] = useState("");
  const [status,setStatus] = useState("Acknowledged");
  const [busy,setBusy] = useState(false);
  const addResponse = async (e) => { e.preventDefault(); setBusy(true); const report = reports.items.find(r=>String(r.id)===String(reportId)); try { await responses.create({reportId:Number(reportId),platform:report?.platform||platform,message,status,date:new Date().toISOString().slice(0,10)}); setMessage(""); notify("Organisation response recorded."); } catch { notify("Could not save response."); } finally { setBusy(false); } };
  const updateResponse = async (r,newStatus) => { await responses.update(r.id,{status:newStatus}); notify("Response status updated."); };
  const deleteResponse = async (r) => { if(window.confirm("Delete this response?")) { await responses.remove(r.id); notify("Response removed."); } };
  return <><PageHeading eyebrow="FOLLOW-THROUGH & REMEDIATION" title="Accountability tracker" description="Record organisational responses and track whether reported issues have been addressed." action={<Tag tone="outline">PUBLIC RESPONSE LOG</Tag>}/>
    <div className="accountability-grid"><section className="panel response-form-panel"><div className="panel-heading"><div><h3>Record an organisation response</h3><p>Responses are separate from the original finding.</p></div><MessageSquareText size={19} className="muted"/></div><form onSubmit={addResponse} className="response-form"><Field label="Related report" required><select required value={reportId} onChange={e=>setReportId(e.target.value)}><option value="">Choose a report</option>{reports.items.map(r=><option value={r.id} key={r.id}>{r.platform} — {r.title}</option>)}</select></Field><Field label="Response or action taken" required><textarea required minLength="10" rows="4" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Summarise the organisation's response or corrective action..."/></Field><Field label="Response status"><select value={status} onChange={e=>setStatus(e.target.value)}><option>Acknowledged</option><option>Action proposed</option><option>In progress</option><option>Resolved</option><option>Disputed</option></select></Field><button className="button primary" disabled={busy||!reportId}><Plus size={15}/> Record response</button></form></section>
      <section className="panel"><div className="panel-heading"><div><h3>Response history</h3><p>{responses.items.length} recorded responses</p></div><Activity size={18} className="muted"/></div><div className="response-list">{responses.items.map(r=><div className="response-item" key={r.id}><div className="response-marker"><MessageSquareText size={16}/></div><div className="response-content"><div className="response-top"><b>{r.platform}</b><Tag tone={r.status==="Resolved"?"green":r.status==="Disputed"?"red":"blue"}>{r.status}</Tag></div><small>Response to report #{r.reportId} · {r.date}</small><p>{r.message}</p><div className="response-controls"><select value={r.status} onChange={e=>updateResponse(r,e.target.value)}><option>Acknowledged</option><option>Action proposed</option><option>In progress</option><option>Resolved</option><option>Disputed</option></select><button className="text-button danger-text" onClick={()=>deleteResponse(r)}><Trash2 size={13}/> Remove</button></div></div></div>)}{!responses.items.length&&<Empty text="Organisation responses will appear here."/>}</div></section></div>
    <div className="disclaimer"><ShieldCheck size={16}/><span>PatternWatch records responses but does not independently certify a resolution. A response marked “Resolved” is an organisation-reported status unless a reviewer separately verifies the change.</span></div>
  </>;
}

export default App;