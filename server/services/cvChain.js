import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';

const LATEX_TEMPLATE = `%-------------------------
\\\\documentclass[letterpaper,11pt]{article}

\\\\usepackage{latexsym}
\\\\usepackage{marvosym}
\\\\usepackage[usenames,dvipsnames]{xcolor}
\\\\usepackage{verbatim}
\\\\usepackage[hidelinks]{hyperref}
\\\\usepackage{fancyhdr}
\\\\usepackage[english]{babel}
\\\\usepackage{tabularx}
\\\\usepackage[left=0.5in, top=0.5in, right=0.5in, bottom=0.5in]{geometry}

\\\\pagestyle{fancy}
\\\\fancyhf{}
\\\\fancyfoot{}
\\\\renewcommand{\\\\headrulewidth}{0pt}
\\\\renewcommand{\\\\footrulewidth}{0pt}

\\\\urlstyle{same}
\\\\raggedbottom
\\\\raggedright
\\\\setlength{\\\\tabcolsep}{0in}

% Custom section styling
\\\\renewcommand{\\\\section}[1]{
  \\\\vspace{4pt}
  {\\\\large\\\\scshape\\\\raggedright #1}
  \\\\vspace{2pt}
  \\\\hrule
  \\\\vspace{5pt}
}

% Custom list environments
\\\\newcommand{\\\\resumeSubHeadingListStart}{\\\\begin{list}{}{\\\\setlength{\\\\leftmargin}{0.15in}\\\\setlength{\\\\labelwidth}{0pt}\\\\setlength{\\\\labelsep}{0pt}\\\\setlength{\\\\itemsep}{0pt}\\\\setlength{\\\\parsep}{0pt}}}
\\\\newcommand{\\\\resumeSubHeadingListEnd}{\\\\end{list}}
\\\\newcommand{\\\\resumeItemListStart}{\\\\begin{itemize}\\\\setlength{\\\\itemsep}{0pt}\\\\setlength{\\\\parsep}{0pt}}
\\\\newcommand{\\\\resumeItemListEnd}{\\\\end{itemize}\\\\vspace{-5pt}}

\\\\renewcommand\\\\labelitemii{$\\\\vcenter{\\\\hbox{\\\\tiny$\\\\bullet$}}$}

\\\\begin{document}`;

const LATEX_EXAMPLE = `%----------HEADING----------
\\\\begin{center}
    \\\\textbf{\\\\Huge \\\\scshape John Doe} \\\\\\\\ \\\\vspace{1pt}
    \\\\small 555-123-4567 $|$ \\\\href{mailto:john@example.com}{john@example.com} $|$
    \\\\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe} $|$
    \\\\href{https://github.com/johndoe}{github.com/johndoe}
\\\\end{center}

%-----------EDUCATION-----------
\\\\section{Education}
  \\\\resumeSubHeadingListStart
    \\\\item
    \\\\begin{tabular*}{0.97\\\\textwidth}[t]{l@{\\\\extracolsep{\\\\fill}}r}
      \\\\textbf{University Name} & City, Country \\\\\\\\
      \\\\textit{\\\\small Bachelor of Science in Computer Science} & \\\\textit{\\\\small Sep 2018 -- Jun 2022} \\\\\\\\
    \\\\end{tabular*}\\\\vspace{-7pt}
  \\\\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\\\section{Experience}
  \\\\resumeSubHeadingListStart
    \\\\item
    \\\\begin{tabular*}{0.97\\\\textwidth}[t]{l@{\\\\extracolsep{\\\\fill}}r}
      \\\\textbf{Software Engineer} & Jan 2023 -- Present \\\\\\\\
      \\\\textit{\\\\small Company Name} & \\\\textit{\\\\small City, Country} \\\\\\\\
    \\\\end{tabular*}\\\\vspace{-7pt}
    \\\\resumeItemListStart
      \\\\item \\\\small{Developed a web application using React and Node.js \\\\vspace{-2pt}}
      \\\\item \\\\small{Improved system performance by 30\\\\% through optimization \\\\vspace{-2pt}}
    \\\\resumeItemListEnd
  \\\\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\\\section{Projects}
  \\\\resumeSubHeadingListStart
    \\\\item
    \\\\begin{tabular*}{0.97\\\\textwidth}{l@{\\\\extracolsep{\\\\fill}}r}
      \\\\small\\\\textbf{Project Name} $|$ \\\\emph{React, Node.js, MongoDB} & 2023 \\\\\\\\
    \\\\end{tabular*}\\\\vspace{-7pt}
    \\\\resumeItemListStart
      \\\\item \\\\small{Built a full-stack web application \\\\vspace{-2pt}}
    \\\\resumeItemListEnd
  \\\\resumeSubHeadingListEnd

%-----------SKILLS-----------
\\\\section{Skills}
  \\\\resumeSubHeadingListStart
    \\\\item
    \\\\textbf{Languages}{: JavaScript, Python, Java} \\\\\\\\
    \\\\textbf{Frameworks}{: React, Node.js, Express} \\\\\\\\
    \\\\textbf{Tools}{: Git, Docker, AWS}
  \\\\resumeSubHeadingListEnd

\\\\end{document}`;

/**
 * Serialize a profile object into a compact string.
 */
function serializeProfile(profile) {
    return JSON.stringify(profile, null, 2);
}

/**
 * Generate a personalized LaTeX CV using LangChain + Gemini.
 *
 * @param {object} profile - Full profile object from MongoDB
 * @param {string} jobDescription - Job description text
 * @returns {Promise<string>} - Clean LaTeX code string
 */
export async function generateCVLatex(profile, jobDescription) {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.3,
    });

    const mergedProfile = serializeProfile(profile);

    const prompt = `You are a LaTeX CV generator. You MUST produce valid, compilable LaTeX code.

USER PROFILE:
${mergedProfile}

JOB DESCRIPTION:
${jobDescription}

PREAMBLE (use exactly as-is, do NOT modify):
\`\`\`latex
${LATEX_TEMPLATE}
\`\`\`

EXAMPLE DOCUMENT BODY (shows the EXACT structure to follow):
\`\`\`latex
${LATEX_EXAMPLE}
\`\`\`

CRITICAL STRUCTURAL RULES — VIOLATION WILL CAUSE COMPILATION FAILURE:
1. The preamble above MUST be included verbatim. Do NOT add any \\usepackage commands.
2. Every \\section{} MUST be followed by \\resumeSubHeadingListStart ... \\resumeSubHeadingListEnd
3. Inside \\resumeSubHeadingListStart, use \\item followed by \\begin{tabular*} for each entry.
4. Bullet points MUST be wrapped: \\resumeItemListStart ... \\item \\small{text} ... \\resumeItemListEnd
5. NEVER use \\item outside of \\resumeSubHeadingListStart or \\resumeItemListStart.
6. For the Skills section, use \\resumeSubHeadingListStart with a single \\item containing \\textbf{Skill}{: values} lines.
7. Escape ALL special characters in user data: & -> \\&, % -> \\%, # -> \\#, _ -> \\_
8. Return ONLY the complete LaTeX source from \\documentclass to \\end{document}.
9. Do NOT wrap in markdown code fences.
10. Do NOT invent custom macros. Use ONLY the expanded forms shown in the example.

Fill the CV with the user's real data, tailored to the job description. Include sections: Heading, Education, Experience, Projects (if relevant), and Skills.`;

    const response = await model.invoke([new HumanMessage(prompt)]);

    let latex = response.content;

    // Strip markdown code block wrappers if present
    latex = latex.replace(/^```(?:latex)?\n?/, '').replace(/\n?```\s*$/, '').trim();

    return latex;
}
