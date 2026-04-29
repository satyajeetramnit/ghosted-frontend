const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const classReplacements = [
  { regex: /text-muted-foreground\/10/g, to: 'text-muted-foreground/50' },
  { regex: /text-muted-foreground\/20/g, to: 'text-muted-foreground/60' },
  { regex: /text-muted-foreground\/30/g, to: 'text-muted-foreground/70' },
  { regex: /text-muted-foreground\/40/g, to: 'text-muted-foreground/80' },
  { regex: /text-foreground\/10/g, to: 'text-foreground/50' },
  { regex: /text-foreground\/20/g, to: 'text-foreground/60' },
  { regex: /text-foreground\/30/g, to: 'text-foreground/70' },
  { regex: /text-foreground\/40/g, to: 'text-foreground/80' },
  { regex: /bg-surface\/30/g, to: 'bg-surface/50' },
  { regex: /bg-background\/20/g, to: 'bg-background/50' },
  { regex: /bg-background\/40/g, to: 'bg-background/60' },
  // also bump very low opacities
  { regex: /opacity-\[0\.02\]/g, to: 'opacity-[0.05]' },
  { regex: /opacity-\[0\.03\]/g, to: 'opacity-[0.05]' },
];

const wordReplacements = [
  { regex: /Artifact Library/g, to: 'Saved Resumes' },
  { regex: /Resume Forge/g, to: 'Resume Builder' },
  { regex: /Forge New Artifact/g, to: 'Create New Resume' },
  { regex: /Forge Artifact/g, to: 'Create Resume' },
  { regex: /Temporal records of professional engagement/g, to: 'Your work experience and professional history' },
  { regex: /Temporal Records/g, to: 'Experience' },
  { regex: /Experience Blueprint/g, to: 'Experience' },
  { regex: /Academic Foundation/g, to: 'Education' },
  { regex: /Foundational knowledge systems and certification/g, to: 'Your academic background and degrees' },
  { regex: /Signal Prototypes/g, to: 'Projects' },
  { regex: /Applied intelligence and functional artifacts/g, to: 'Personal projects and applications' },
  { regex: /Enterprise Name/g, to: 'Company Name' },
  { regex: /Designated Title/g, to: 'Job Title' },
  { regex: /Temporal Start/g, to: 'Start Date' },
  { regex: /Temporal End/g, to: 'End Date' },
  { regex: /Geographic Location/g, to: 'Location' },
  { regex: /Magnitude \(GPA\/CGPA\)/g, to: 'GPA / CGPA' },
  { regex: /Conferred Date/g, to: 'Graduation Date' },
  { regex: /Digital Signal Link/g, to: 'Link' },
  { regex: /Digital Signal Link \(URL\)/g, to: 'Link (URL)' },
  { regex: /Prototype Designation/g, to: 'Project Name' },
  { regex: /Stakeholder Hub/g, to: 'Contacts Hub' },
  { regex: /Establish Connection/g, to: 'Add Contact' },
  { regex: /Global Network/g, to: 'Network' },
  { regex: /Intelligence Platform/g, to: 'Application Platform' },
  { regex: /Intelligence Forge/g, to: 'Resume Forge' }, // Or Resume Builder
  { regex: /Targeting/g, to: 'Target' },
  { regex: /Target Enterprise/g, to: 'Target Company' },
  { regex: /Objective Role/g, to: 'Target Role' },
  { regex: /Digital Signal Injection/g, to: 'Social Links' },
  { regex: /Active signals will be compiled into the artifact header/g, to: 'These links will be included in your resume header.' },
  { regex: /Commit Changes/g, to: 'Save Changes' },
  { regex: /Commit to Library/g, to: 'Save to Library' },
  { regex: /Artifact Compiled/g, to: 'Resume Saved' },
  { regex: /Semantic View/g, to: 'Content View' },
  { regex: /Source Code/g, to: 'LaTeX Source' },
  { regex: /Artifact PDF/g, to: 'Preview PDF' },
  { regex: /System Standby/g, to: 'Ready' },
  { regex: /Input target intelligence \(Job Description\) to initialize artifact synthesis./g, to: 'Input a Job Description to generate a tailored resume.' },
  { regex: /Semantic profile incomplete/g, to: 'Profile incomplete' },
  { regex: /Forge will utilize generic intelligence/g, to: 'The generator will use default values.' },
  { regex: /Configure Core/g, to: 'Settings' },
  { regex: /Ingest Data/g, to: 'Upload Data' },
  { regex: /Inject Record/g, to: 'Add Experience' },
  { regex: /Inject Foundation/g, to: 'Add Education' },
  { regex: /Inject Prototype/g, to: 'Add Project' },
  { regex: /Establish Record/g, to: 'Save Experience' },
  { regex: /Establish Foundation/g, to: 'Save Education' },
  { regex: /Establish Prototype/g, to: 'Save Project' },
  { regex: /Refine Connection/g, to: 'Edit Contact' },
  { regex: /New Stakeholder/g, to: 'New Contact' },
  { regex: /Establishing professional influence/g, to: 'Add a new professional contact' },
  { regex: /Digital Identity \(Email\)/g, to: 'Email Address' },
  { regex: /Voice \(Phone\)/g, to: 'Phone Number' },
  { regex: /Social Intel \(LinkedIn\)/g, to: 'LinkedIn Profile' },
  { regex: /Classification/g, to: 'Category' },
  { regex: /Entity Name/g, to: 'Contact Name' },
  { regex: /Organization/g, to: 'Company' },
  { regex: /Abort/g, to: 'Cancel' },
  { regex: /Neural Configuration/g, to: 'Profile Configuration' },
  { regex: /Core Identity Parameters/g, to: 'Basic Information' },
  { regex: /Define the primary operational parameters for your professional identity/g, to: 'Set your primary contact information and identity' },
  { regex: /Full Name/g, to: 'Full Name' },
  { regex: /Professional Title/g, to: 'Job Title' },
  { regex: /Geographic Base/g, to: 'Location' },
  { regex: /Digital Presence/g, to: 'Social Links' },
  { regex: /Configure your external signal vectors/g, to: 'Add your professional portfolio links' },
  { regex: /Commit Configuration/g, to: 'Save Profile' },
  { regex: /Mission Archive/g, to: 'Interview History' },
  { regex: /Tactical Briefing/g, to: 'Upcoming Interviews' },
  { regex: /Tactical syncs and technical evaluations/g, to: 'Manage your upcoming interviews' },
  { regex: /Sync/g, to: 'Interview' },
  { regex: /Operational/g, to: 'Active' },
  { regex: /Professional evolution/g, to: 'Career progress' },
  { regex: /Manage your professional evolution/g, to: 'Track and manage your job applications' },
  { regex: /Flood the funnel/g, to: 'Apply to more jobs' },
  { regex: /Start tracking your next big move today/g, to: 'Start tracking your applications today' },
  { regex: /Launch First Application/g, to: 'Add First Application' },
  { regex: /Silent Network/g, to: 'No Contacts' },
  { regex: /No stakeholders found/g, to: 'No contacts found' },
  { regex: /Establish new professional connections/g, to: 'Add new professional contacts' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const rep of classReplacements) {
        if (content.match(rep.regex)) {
          content = content.replace(rep.regex, rep.to);
          changed = true;
        }
      }
      
      for (const rep of wordReplacements) {
        if (content.match(rep.regex)) {
          content = content.replace(rep.regex, rep.to);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Done.');
