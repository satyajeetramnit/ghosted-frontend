import { ResumeData } from "@/types/resume";

/** Escape special LaTeX characters in plain text. */
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}");
}

function href(url: string, label: string): string {
  const safeUrl = url.startsWith("http") ? url : `https://${url}`;
  return `\\href{${safeUrl}}{${esc(label)}}`;
}

function categoriseSkills(skills: string[]) {
  const LANGS = new Set([
    "java", "javascript", "typescript", "python", "go", "golang", "c", "c++", "c#",
    "rust", "ruby", "swift", "kotlin", "scala", "php", "html", "css", "sql", "bash",
    "shell", "r", "dart", "perl",
  ]);
  const TOOLS = new Set([
    "react", "reactjs", "angular", "angularjs", "next.js", "nextjs", "vue", "vue.js",
    "svelte", "git", "gitlab", "github actions", "jira", "figma", "postman", "webpack",
    "jest", "storybook", "helm", "terraform", "ansible", "argocd", "grafana", "prometheus",
    "dbt", "airflow", "octane", "teamcity", "jenkins", "vite", "eslint",
  ]);

  const languages: string[] = [];
  const technologies: string[] = [];
  const tools: string[] = [];

  for (const skill of skills) {
    const lower = skill.toLowerCase().trim();
    if (LANGS.has(lower) || [...LANGS].some((k) => lower.startsWith(k + " "))) {
      languages.push(skill);
    } else if (TOOLS.has(lower) || [...TOOLS].some((k) => lower.includes(k))) {
      tools.push(skill);
    } else {
      technologies.push(skill);
    }
  }

  if (languages.length === 0 && skills.length > 0) languages.push(skills[0]);
  if (technologies.length === 0 && skills.length > 1) technologies.push(skills[1]);
  if (tools.length === 0 && skills.length > 2) tools.push(skills[2]);

  return { languages, technologies, tools };
}

export function generateLatex(resume: ResumeData): string {
  const { languages, technologies, tools } = categoriseSkills(resume.skills);

  const contactParts: string[] = [];
  if (resume.email)
    contactParts.push(`\\href{mailto:${resume.email}}{${esc(resume.email)}}`);
  if (resume.phone)
    contactParts.push(`\\href{tel:${resume.phone.replace(/\s/g, "")}}{${esc(resume.phone)}}`);

  const linkParts: string[] = [];
  if (resume.linkedin) linkParts.push(href(resume.linkedin, "Linkedin"));
  if (resume.leetcode) linkParts.push(href(resume.leetcode, "Leetcode"));
  if (resume.hackerrank) linkParts.push(href(resume.hackerrank, "HackerRank"));
  if (resume.github) linkParts.push(href(resume.github, "GitHub"));
  if (resume.portfolio) linkParts.push(href(resume.portfolio, "Portfolio"));

  const experienceSection = resume.experience
    .map(
      (exp) =>
        `  \\resumeSubheading\n` +
        `    {${esc(exp.company)}}{${esc(exp.location)}}\n` +
        `    {${esc(exp.title)}}{${esc(exp.startDate)} -- ${esc(exp.endDate)}}\n` +
        `    \\resumeItemListStart\n` +
        exp.bullets.map((b) => `      \\resumeItem{}{${esc(b)}}`).join("\n") +
        `\n    \\resumeItemListEnd`
    )
    .join("\n\n");

  const edu = resume.education[0];
  const educationSection = edu
    ? `  \\resumeSubheading\n` +
      `    {{${esc(edu.institution)}}}{${esc(edu.location ?? "")}}\n` +
      `    {${esc(edu.degree)} in ${esc(edu.field)}${edu.gpa ? `;  CGPA: ${esc(edu.gpa)}` : ""}}{${esc(edu.graduationDate)}}\n` +
      `\n  \\vspace{0.2cm}\n` +
      `  \\textbf{Coursework}{: Data Structures \\& Algorithms, Problem Solving, OOPs Concepts.}`
    : "";

  const projectsSection = resume.projects
    .map((proj) => {
      const nameCell = proj.link
        ? `\\href{https://${proj.link}}{${esc(proj.name)}}`
        : esc(proj.name);
      const srcCell = proj.link
        ? `{\\href{https://${proj.link}}{- LaTeX Source}}`
        : "";
      return (
        `  \\resumeSubheading{${nameCell}}{${srcCell}}\n` +
        `    {${esc(proj.description)}}{}\n` +
        `    \\resumeItemListStart\n` +
        `      \\resumeItem{}{${esc(proj.description)}}\n` +
        `      \\resumeItem{}{\\textit{Technologies:} ${proj.technologies.map(esc).join(", ")}}\n` +
        `    \\resumeItemListEnd`
      );
    })
    .join("\n\n");

  return `%-------------------------
% Resume in Latex
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}
\\setlength{\\footskip}{4.08003pt}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[2]{
  \\item\\small{
    \\textbf{#1}{ #2 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}

\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  CV STARTS HERE  %%%%%%%%%%%%%%%%%%%%
\\begin{document}

%---------- HEADING ----------
\\begin{center}
    {\\LARGE \\textbf{${esc(resume.name)}}}\\\\
    ${contactParts.join(" \\textbar{} ")} \\\\
${linkParts.length > 0 ? `    ${linkParts.join(" $|$ ")}` : ""}
\\end{center}
\\vspace{-10pt}

%-----------PROFESSIONAL SUMMARY-----------
\\section{Professional Summary}
\\small{${esc(resume.summary)}}

\\vspace{-6pt}

%-----------SKILLS-----------
\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
\\small{
  \\item \\textbf{Languages:} {${languages.map(esc).join(", ")}.} \\\\
   \\textbf{Technologies:} ${technologies.map(esc).join(", ")}. \\\\
   \\textbf{Frameworks/Tools:} ${tools.map(esc).join(", ")}.\\\\
}
\\end{itemize}

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${experienceSection}
  \\resumeSubHeadingListEnd

%-----------EDUCATION-----------
\\section{Education}
${educationSection}

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projectsSection}
  \\resumeSubHeadingListEnd

%-------------------------------------------
\\end{document}
`;
}
