const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

/**
 * Generates a structured ATS-friendly Word document (.docx) from resume data
 */
async function generateDocxBuffer(resume) {
  const pInfo = resume.personalInfo || {};
  const children = [];

  // Header: Full Name
  children.push(
    new Paragraph({
      text: pInfo.fullName || 'Candidate Name',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );

  // Subtitle / Contact Line
  const contactParts = [
    pInfo.professionalTitle,
    pInfo.email,
    pInfo.phone,
    pInfo.location,
    pInfo.linkedin,
    pInfo.github
  ].filter(Boolean);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 250 },
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 20 // 10pt
        })
      ]
    })
  );

  // Professional Summary
  if (resume.summary) {
    children.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: resume.summary, size: 20 })]
      })
    );
  }

  // Work Experience
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    children.push(
      new Paragraph({
        text: 'WORK EXPERIENCE',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    resume.experience.forEach(exp => {
      const dates = [exp.startDate, exp.currentlyWorking ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({ text: `${exp.role || 'Role'} `, bold: true, size: 22 }),
            new TextRun({ text: `| ${exp.company || 'Company'} (${dates})`, italic: true, size: 20 })
          ]
        })
      );

      if (exp.description) {
        children.push(
          new Paragraph({
            spacing: { after: 50 },
            children: [new TextRun({ text: exp.description, size: 20 })]
          })
        );
      }

      if (Array.isArray(exp.achievements)) {
        exp.achievements.forEach(ach => {
          if (ach) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 40 },
                children: [new TextRun({ text: ach, size: 20 })]
              })
            );
          }
        });
      }
    });
  }

  // Projects
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    children.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    resume.projects.forEach(proj => {
      const techStr = Array.isArray(proj.technologies) && proj.technologies.length > 0 ? ` (${proj.technologies.join(', ')})` : '';
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({ text: proj.name || 'Project Name', bold: true, size: 22 }),
            new TextRun({ text: techStr, italic: true, size: 20 })
          ]
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { after: 50 },
            children: [new TextRun({ text: proj.description, size: 20 })]
          })
        );
      }
    });
  }

  // Technical Skills
  const skills = resume.skills || {};
  const skillCategories = [
    { label: 'Languages', items: skills.programmingLanguages },
    { label: 'Frameworks', items: skills.frameworks },
    { label: 'Databases', items: skills.databases },
    { label: 'Cloud & DevOps', items: skills.cloud },
    { label: 'Tools', items: skills.tools },
    { label: 'Soft Skills', items: skills.softSkills }
  ].filter(c => Array.isArray(c.items) && c.items.length > 0);

  if (skillCategories.length > 0) {
    children.push(
      new Paragraph({
        text: 'TECHNICAL SKILLS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    skillCategories.forEach(c => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${c.label}: `, bold: true, size: 20 }),
            new TextRun({ text: c.items.join(', '), size: 20 })
          ]
        })
      );
    });
  }

  // Education
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    children.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    resume.education.forEach(edu => {
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: `${edu.degree || 'Degree'} in ${edu.field || 'Field'} `, bold: true, size: 20 }),
            new TextRun({ text: `| ${edu.institution} (${dates})`, italic: true, size: 20 })
          ]
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906, // A4 width in dxa (210mm)
            height: 16838 // A4 height in dxa (297mm)
          },
          margin: {
            top: 720,
            right: 720,
            bottom: 720,
            left: 720
          }
        }
      },
      children
    }]
  });

  return await Packer.toBuffer(doc);
}

module.exports = { generateDocxBuffer };
