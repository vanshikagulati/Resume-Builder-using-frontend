// ==== DARK MODE TOGGLE ====
const html = document.documentElement;
const darkToggle = document.getElementById('dark-toggle');
darkToggle.onclick = function() {
  html.classList.toggle('dark');
};

// ==== FORM DATA AND LIVE PREVIEW ====
const form = document.getElementById('resume-form');
const previewFields = {
  name:      document.getElementById('preview-name'),
  title:     document.getElementById('preview-title'),
  location:  document.getElementById('preview-location'),
  email:     document.getElementById('preview-email'),
  phone:     document.getElementById('preview-phone'),
  website:   document.getElementById('preview-website'),
  linkedin:  document.getElementById('preview-linkedin'),
  summary:   document.getElementById('preview-summary'),
  techSkills:document.getElementById('preview-techSkills'),
  softSkills:document.getElementById('preview-softSkills'),
  extras:    document.getElementById('preview-extras'),
  certs:     document.getElementById('preview-certs'),
  edu10:     document.getElementById('preview-edu10'),
  edu12:     document.getElementById('preview-edu12'),
  eduGrad:   document.getElementById('preview-eduGrad'),
};

let projects = [];
let interns = [];

function updatePreview() {
  const data = new FormData(form);
  previewFields.name.textContent      = data.get('name')     || 'Your Name';
  previewFields.title.textContent     = data.get('title')    || 'Your Title';
  previewFields.location.textContent  = data.get('location') || 'Your Location';
  previewFields.email.textContent     = data.get('email')    || '';
  previewFields.phone.textContent     = data.get('phone')    || '';
  previewFields.website.textContent   = data.get('website')  || '';
  previewFields.linkedin.textContent  = data.get('linkedin') || '';
  previewFields.summary.textContent   = data.get('summary')  || 'Short professional summary — your strengths and interests.';
  previewFields.techSkills.innerHTML  = formatSkills(data.get('techSkills'));
  previewFields.softSkills.innerHTML  = formatSkills(data.get('softSkills'));
  previewFields.extras.textContent    = data.get('extracurricular') || '';
  previewFields.certs.innerHTML       = (data.get('certifications') || '').split('\n').filter(l => l.trim()).map(l => `<div>${escapeHTML(l)}</div>`).join('');
  previewFields.edu10.textContent     = data.get('edu10') ? `Class 10th: ${data.get('edu10')}, ${data.get('year10') || ''} — ${data.get('grade10') || ''}` : '';
  previewFields.edu12.textContent     = data.get('edu12') ? `Class 12th: ${data.get('edu12')}, ${data.get('year12') || ''} — ${data.get('grade12') || ''}` : '';
  previewFields.eduGrad.textContent   = data.get('eduGrad') ? `Graduation: ${data.get('eduGrad')}, ${data.get('yearGrad') || ''} — ${data.get('gradeGrad') || ''}` : '';
  
  // Update Projects
  projectsPreview.innerHTML = projects.map(prj => `<div class="item">${escapeHTML(prj)}</div>`).join('');
  // Update Internships
  internsPreview.innerHTML = interns.map(it => `<div class="item">${escapeHTML(it)}</div>`).join('');
}

function escapeHTML (str = "") { return str.replace(/[<>&]/g, s => ({'<': '&lt;','>':'&gt;','&':'&amp;'}[s])); }
function formatSkills(s) {
  return (s||'').split(',')
    .filter(x=>x.trim()).map(x=>`<span class="skills">${escapeHTML(x.trim())}</span>`).join('');
}

form.addEventListener('input', updatePreview);

// ==== PHOTO PREVIEW ====
const photoInput = form.elements.photo;
photoInput.onchange = function(e) {
  if (this.files && this.files[0]) {
    const url = URL.createObjectURL(this.files[0]);
    document.getElementById('preview-photo').src = url;
  }
}

// ==== PROJECTS ====
const projectsUI = document.getElementById('projectsInputs');
const projectsPreview = document.getElementById('preview-projects');
document.getElementById('addProject').onclick = function(e) {
  e.preventDefault();
  const val = document.getElementById('projectTempTitle').value.trim();
  if(val) {
    projects.push(val);
    renderProjects();
    document.getElementById('projectTempTitle').value = '';
    updatePreview();
  }
};
function renderProjects() {
  projectsUI.innerHTML = projects.map((prj,i) =>
    `<div class="row" style="margin:4px 0;">
      <span>${escapeHTML(prj)}</span>
      <button type="button" class="btn small secondary" onclick="removeProject(${i})">Remove</button>
    </div>`).join('');
}
window.removeProject = (i) => { projects.splice(i,1); renderProjects(); updatePreview(); };

// ==== INTERN/EXPERIENCE ====
const internsUI = document.getElementById('internInputs');
const internsPreview = document.getElementById('preview-interns');
document.getElementById('addIntern').onclick = function(e) {
  e.preventDefault();
  const val = document.getElementById('internTemp').value.trim();
  if(val) {
    interns.push(val);
    renderInterns();
    document.getElementById('internTemp').value = '';
    updatePreview();
  }
};
function renderInterns() {
  internsUI.innerHTML = interns.map((it,i) =>
    `<div class="row" style="margin:4px 0;">
      <span>${escapeHTML(it)}</span>
      <button type="button" class="btn small secondary" onclick="removeIntern(${i})">Remove</button>
    </div>`).join('');
}
window.removeIntern = (i) => { interns.splice(i,1); renderInterns(); updatePreview(); };

// ==== PDF EXPORT WITH html2canvas + jsPDF: WYSIWYG ====
document.getElementById('export-pdf').onclick = async function(e) {
  e.preventDefault();

  const resumeElement = document.getElementById('resumeRoot');
  // Hide progress bar temporarily
  let prog = resumeElement.querySelector('.progress');
  let progDisplay = "";
  if(prog) {
    progDisplay = prog.style.display;
    prog.style.display = "none";
  }
  // Force light background for PDF
  const priorBg = resumeElement.style.backgroundColor;
  resumeElement.style.background = "#fff";

  await new Promise(res => setTimeout(res, 150));

  // Take screenshot of current preview ("as you see it")
  const canvas = await html2canvas(resumeElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fff"
  });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  // Create PDF
  const pdf = new window.jspdf.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  // Fit image to A4 while maintaining ratio
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  let ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
  let pdfWidth = imgWidth * ratio;
  let pdfHeight = imgHeight * ratio;
  let offsetX = (pageWidth - pdfWidth) / 2;
  let offsetY = 15;

  pdf.addImage(imgData, 'JPEG', offsetX, offsetY, pdfWidth, pdfHeight);
  pdf.save('My_Resume.pdf');

  // Restore UI
  if(prog) prog.style.display = progDisplay;
  resumeElement.style.background = priorBg || "";

};

renderProjects();
renderInterns();
updatePreview();
