const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

let applications = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Software Engineer",
    status: "APPLIED",
    appliedDate: new Date().toISOString(),
    interviews: [],
    oa: null,
    contactId: "c1",
    contactName: "John Recruiter",
    contactCategory: "HR"
  }
];

let contacts = [
  {
    id: "c1",
    name: "John Recruiter",
    email: "john@google.com",
    phone: "1234567890",
    linkedInUrl: "https://linkedin.com/in/john",
    companyName: "Google",
    category: "HR"
  },
  {
    id: "c2",
    name: "Jane Doe",
    email: "joh@gmail.vom",
    phone: "0987654321",
    linkedInUrl: "https://linkedin.com/in/jane",
    category: "HR"
  },
  {
    id: "c3",
    name: "John Doe",
    phone: "0987654321",
    companyName: "Microsoft",
    category: "HR"
  }
];

app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, data: { id: "u1", email: req.body.email, firstName: "Test", lastName: "User" } });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, data: { token: "mock-jwt-token", user: { id: "u1", email: req.body.email } } });
});

app.get('/api/contacts', (req, res) => {
  res.json({ success: true, data: { content: contacts } });
});

app.post('/api/contacts', (req, res) => {
  const newContact = { id: "c" + (contacts.length + 1), ...req.body };
  contacts.push(newContact);
  res.json({ success: true, data: newContact });
});

app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...req.body };
    res.json({ success: true, data: contacts[index] });
  } else {
    res.status(404).json({ success: false, message: 'Contact not found' });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts.splice(index, 1);
    res.json({ success: true, message: 'Contact deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Contact not found' });
  }
});

const getPopulatedApp = (app) => {
  const contact = contacts.find(c => c.id === app.contactId);
  return { ...app, contact };
};

app.get('/api/applications', (req, res) => {
  res.json({ success: true, data: { content: applications.map(getPopulatedApp) } });
});

app.post('/api/applications', (req, res) => {
  let contactId = req.body.contactId;

  if (!contactId && req.body.contactName) {
    const newContact = { 
      id: "c" + (contacts.length + 1), 
      name: req.body.contactName, 
      email: req.body.contactEmail,
      category: 'HR' 
    };
    contacts.push(newContact);
    contactId = newContact.id;
  }

  const newApp = { 
    id: "" + (applications.length + 1), 
    status: "APPLIED",
    appliedDate: new Date().toISOString(),
    interviews: [],
    oa: null,
    ...req.body,
    contactId 
  };
  applications.push(newApp);
  res.json({ success: true, data: getPopulatedApp(newApp) });
});

app.put('/api/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const app = applications.find(a => a.id === id);
  if (app) app.status = status;
  res.json({ success: true, data: getPopulatedApp(app) });
});

app.put('/api/applications/:id/oa', (req, res) => {
  const { id } = req.params;
  const app = applications.find(a => a.id === id);
  if (app) {
    app.oa = { id: "oa" + (Math.random()*1000|0), ...req.body };
  }
  res.json({ success: true, data: app.oa });
});

app.post('/api/applications/:id/interviews', (req, res) => {
  const { id } = req.params;
  const app = applications.find(a => a.id === id);
  const newInterview = { id: "i" + (app.interviews.length + 1), ...req.body };
  if (app) app.interviews.push(newInterview);
  res.json({ success: true, data: newInterview });
});

app.put('/api/applications/:id/interviews/:iid', (req, res) => {
  const { id, iid } = req.params;
  const app = applications.find(a => a.id === id);
  const interview = app.interviews.find(i => i.id === iid);
  if (interview) Object.assign(interview, req.body);
  res.json({ success: true, data: interview });
});

app.get('/api/applications/interviews', (req, res) => {
  const allInterviews = applications.flatMap(app => 
    app.interviews.map(i => ({ ...i, application: { id: app.id, companyName: app.companyName, jobTitle: app.jobTitle } }))
  );
  res.json({ success: true, data: allInterviews });
});

app.listen(port, () => {
  console.log(`Mock backend listening at http://localhost:${port}`);
});
