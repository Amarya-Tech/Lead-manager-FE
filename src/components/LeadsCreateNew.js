import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "./SideBar.js";
import './css/LeadsCreateNew.css';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Container
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Pending as PendingIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';

const LeadsNewPage = () => {
  const navigate = useNavigate();
  const userId = Cookies.get("user_id");
  const userRole = Cookies.get("role")

  const [leadId, setLeadId] = useState(null);
  const [users, setUsers] = useState([]);
  const [industryTypes, setIndustryTypes] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [description, setDescription] = useState('');

  // Section completion states
  const [companySaved, setCompanySaved] = useState(false);
  const [officeSaved, setOfficeSaved] = useState(false);
  const [officeSkipped, setOfficeSkipped] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactSkipped, setContactSkipped] = useState(false);
  const [assigneeSaved, setAssigneeSaved] = useState(false);
  const [assigneeSkipped, setAssigneeSkipped] = useState(false);

  // Error states
  const [showCompanyErrors, setShowCompanyErrors] = useState(false);
  const [showOfficeErrors, setShowOfficeErrors] = useState(false);
  const [showContactErrors, setShowContactErrors] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    product: '',
    industry_type: '',
    export_value: '',
    insured_amount: '',
  });

  const [officeForm, setOfficeForm] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    designation: '',
    phone: '',
    alt_phone: '',
    email: '',
  });

  // Validation functions
  const validateCompanyForm = () => {
    return companyForm.company_name.trim() !== '' && companyForm.industry_type.trim() !== '';
  };

  const validateOfficeForm = () => {
    return officeForm.address.trim() !== '' &&
      officeForm.city.trim() !== '' &&
      officeForm.state.trim() !== '' &&
      officeForm.country.trim() !== '' &&
      officeForm.postal_code.trim() !== '';
  };

  const validateContactForm = () => {
    return contactForm.name.trim() !== '' && contactForm.designation.trim() !== '';
  };

  useEffect(() => {
    fetchUsers();
    fetchIndustryTypes();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/user/fetch-active-user-list');

      if (response.data && response.data.success && response.data.data) {
        setUsers(response.data.data);
      } else {
        console.error('Failed to fetch users:', response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users list');
    }
  };

  const fetchIndustryTypes = async () => {
    try {
      const response = await apiClient.get('/lead/fetch-industry-type');
      if (response.data && response.data.success && response.data.data) {
        setIndustryTypes(response.data.data);
      } else {
        console.error('Failed to fetch industry types:', response.data);
        toast.error('Failed to fetch industry types');
      }
    } catch (error) {
      console.error('Error fetching industry types:', error);
      toast.error('Failed to fetch industry types');
    }
  };

  const saveCompanyInfo = async () => {
    setShowCompanyErrors(true);

    if (!validateCompanyForm()) {
      toast.error('Please fill in all required company fields');
      return;
    }

    if (companySaved) {
      toast.info('Company information already saved');
      return;
    }

    try {
      const requestBody = {
        company_name: companyForm.company_name,
        industry_type: companyForm.industry_type,
        ...(companyForm.product && { product: companyForm.product }),
        ...(companyForm.export_value && { export_value: companyForm.export_value }),
        ...(companyForm.insured_amount && { insured_amount: companyForm.insured_amount }),
      };

      const response = await apiClient.post(`/lead/create-lead/${userId}`, requestBody);
      const { success, message, data } = response.data || {};
      setLeadId(data.lead_id);
      setCompanySaved(true);
      toast.success('Company information saved successfully');
    } catch (error) {
      console.error('Failed to create lead:', error);
      const backendMessage = error.response?.data?.message || 'Failed to create lead';
      toast.error(backendMessage);
    }
  };

  const saveOfficeInfo = async () => {
    if (!leadId) {
      toast.error('Please save company information first');
      return;
    }

    if (officeSaved || officeSkipped) {
      toast.info('Office information already processed');
      return;
    }

    setShowOfficeErrors(true);

    if (!validateOfficeForm()) {
      toast.error('Please fill in all required office fields');
      return;
    }

    try {
      const response = await apiClient.post(`/lead/add-lead-office`, {
        lead_id: leadId,
        ...officeForm,
      });

      if (response.data.success) {
        setOfficeSaved(true);
        setShowOfficeErrors(false);
        toast.success('Office information saved successfully');
      } else {
        console.error('Invalid save office response:', response.data);
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'Failed to save office';
      toast.error(backendMessage);
      console.error('Failed to save office:', error);
    }
  };

  const skipOfficeInfo = () => {
    if (!leadId) {
      toast.error('Please save company information first');
      return;
    }

    if (officeSaved || officeSkipped) {
      toast.info('Office information already processed');
      return;
    }

    setOfficeSkipped(true);
    toast.info('Office details skipped. You can add them later.');
  };

  const saveContactInfo = async () => {
    if (!leadId) {
      toast.error('Please save company information first');
      return;
    }

    if (contactSaved || contactSkipped) {
      toast.info('Contact information already processed');
      return;
    }

    setShowContactErrors(true);

    if (!validateContactForm()) {
      toast.error('Please fill in all required contact fields');
      return;
    }

    try {
      const requestBody = {
        lead_id: leadId,
        name: contactForm.name,
        designation: contactForm.designation,
        ...(contactForm.phone && { phone: contactForm.phone }),
        ...(contactForm.alt_phone && { alt_phone: contactForm.alt_phone }),
        ...(contactForm.email && { email: contactForm.email }),
      };

      const response = await apiClient.post(`/lead/add-lead-contact/${userId}`, requestBody);

      if (response.data.success) {
        setContactSaved(true);
        setShowContactErrors(false);
        toast.success('Contact information saved successfully');
      } else {
        console.error('Invalid save contact response:', response.data);
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'Failed to save contact';
      toast.error(backendMessage);
      console.error('Failed to save contact:', error);
    }
  };

  const skipContactInfo = () => {
    if (!leadId) {
      toast.error('Please save company information first');
      return;
    }

    if (contactSaved || contactSkipped) {
      toast.info('Contact information already processed');
      return;
    }

    setContactSkipped(true);
    toast.info('Contact details skipped. You can add them later.');
  };

  const assignSalesRep = async () => {
    if (!leadId) {
      toast.error('Please save company information first');
      return;
    }

    if (assigneeSaved || assigneeSkipped) {
      toast.info('Sales representative assignment already processed');
      return;
    }

    if (!selectedAssignee) {
      toast.error('Please select a sales representative');
      return;
    }

    try {
      const requestBody = {
        lead_id: leadId,
        assignee_id: selectedAssignee,
        ...(description && { description: description }),
      };

      const response = await apiClient.post('/lead-com/add-assignee', requestBody);

      if (response.data.success) {
        setAssigneeSaved(true);
        toast.success('Sales representative assigned successfully');
      } else {
        console.error('Invalid assign response:', response.data);
        toast.error('Failed to assign sales representative');
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'Failed to assign sales representative';
      toast.error(backendMessage);
      console.error('Failed to assign sales rep:', error);
    }
  };

  const skipAssignee = () => {
    if (!leadId) {
      toast.error('Please save company information first');
      return;
    }

    if (assigneeSaved || assigneeSkipped) {
      toast.info('Sales representative assignment already processed');
      return;
    }

    setAssigneeSkipped(true);
    toast.info('Sales representative assignment skipped. You can assign later from the leads list.');
  };

  const isFormComplete = () => {
    return companySaved &&
      (officeSaved || officeSkipped) &&
      (contactSaved || contactSkipped) &&
      (assigneeSaved || assigneeSkipped);
  };

  const getSectionStatus = (saved, skipped) => {
    if (saved) return { text: 'Saved', icon: <CheckCircleIcon />, color: 'success' };
    if (skipped) return { text: 'Skipped', icon: <WarningIcon />, color: 'warning' };
    return { text: 'Pending', icon: <PendingIcon />, color: 'default' };
  };

  return (
      <Box display="flex" sx={{
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
      }}>
        <Sidebar />
        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          ml: '24px',
          width: 'calc(100% - 240px)',
        }}>
          <Container maxWidth="lg">
            <Typography variant="h5" sx={{
              fontSize: '28px',
              mb: '20px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
            }}>
              Add Lead
            </Typography>

            {leadId && (
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Form Status:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip
                      icon={getSectionStatus(companySaved, false).icon}
                      label={`Company: ${getSectionStatus(companySaved, false).text}`}
                      color={getSectionStatus(companySaved, false).color}
                      variant={companySaved ? "filled" : "outlined"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip
                      icon={getSectionStatus(officeSaved, officeSkipped).icon}
                      label={`Office: ${getSectionStatus(officeSaved, officeSkipped).text}`}
                      color={getSectionStatus(officeSaved, officeSkipped).color}
                      variant={officeSaved ? "filled" : officeSkipped ? "filled" : "outlined"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip
                      icon={getSectionStatus(contactSaved, contactSkipped).icon}
                      label={`Contact: ${getSectionStatus(contactSaved, contactSkipped).text}`}
                      color={getSectionStatus(contactSaved, contactSkipped).color}
                      variant={contactSaved ? "filled" : contactSkipped ? "filled" : "outlined"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip
                      icon={getSectionStatus(assigneeSaved, assigneeSkipped).icon}
                      label={`Assignment: ${getSectionStatus(assigneeSaved, assigneeSkipped).text}`}
                      color={getSectionStatus(assigneeSaved, assigneeSkipped).color}
                      variant={assigneeSaved ? "filled" : assigneeSkipped ? "filled" : "outlined"}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* COMPANY INFORMATION SECTION */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Company Information"
                action={
                  companySaved && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Saved"
                      color="success"
                      size="small"
                    />
                  )
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      placeholder="Enter company name"
                      value={companyForm.company_name}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, company_name: e.target.value })
                      }
                      error={showCompanyErrors && !companyForm.company_name}
                      disabled={companySaved}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={showCompanyErrors && !companyForm.industry_type} sx={{ minWidth: 300 }}>
                      <InputLabel>Industry Type</InputLabel>
                      <Select
                        value={companyForm.industry_type}
                        label="Industry Type"
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, industry_type: e.target.value })
                        }
                        disabled={companySaved}
                      >
                        <MenuItem value="">Select industry</MenuItem>
                        {industryTypes.map((industry) => (
                          <MenuItem key={industry.id} value={industry.industry_name}>
                            {industry.industry_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Product"
                      placeholder="Enter Product"
                      value={companyForm.product}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, product: e.target.value })
                      }
                      disabled={companySaved}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Export Value"
                      placeholder="Enter export value"
                      value={companyForm.export_value}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, export_value: e.target.value })
                      }
                      disabled={companySaved}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Insured Amount"
                      placeholder="Enter insured amount"
                      value={companyForm.insured_amount}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, insured_amount: e.target.value })
                      }
                      disabled={companySaved}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={saveCompanyInfo}
                    disabled={companySaved}
                    size="large"
                  >
                    {companySaved ? 'Saved' : 'Save Company Info'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* OFFICE DETAILS SECTION */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Office Details"
                action={
                  <>
                    {officeSaved && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Saved"
                        color="success"
                        size="small"
                      />
                    )}
                    {officeSkipped && (
                      <Chip
                        icon={<WarningIcon />}
                        label="Skipped"
                        color="warning"
                        size="small"
                      />
                    )}
                  </>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      placeholder="Enter address"
                      value={officeForm.address}
                      onChange={(e) =>
                        setOfficeForm({ ...officeForm, address: e.target.value })
                      }
                      error={showOfficeErrors && !officeForm.address}
                      disabled={officeSaved || officeSkipped}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="City"
                      placeholder="Enter city"
                      value={officeForm.city}
                      onChange={(e) =>
                        setOfficeForm({ ...officeForm, city: e.target.value })
                      }
                      error={showOfficeErrors && !officeForm.city}
                      disabled={officeSaved || officeSkipped}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="State"
                      placeholder="Enter state"
                      value={officeForm.state}
                      onChange={(e) =>
                        setOfficeForm({ ...officeForm, state: e.target.value })
                      }
                      error={showOfficeErrors && !officeForm.state}
                      disabled={officeSaved || officeSkipped}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Country"
                      placeholder="Enter country"
                      value={officeForm.country}
                      onChange={(e) =>
                        setOfficeForm({ ...officeForm, country: e.target.value })
                      }
                      error={showOfficeErrors && !officeForm.country}
                      disabled={officeSaved || officeSkipped}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      placeholder="Enter postal code"
                      value={officeForm.postal_code}
                      onChange={(e) =>
                        setOfficeForm({ ...officeForm, postal_code: e.target.value })
                      }
                      error={showOfficeErrors && !officeForm.postal_code}
                      disabled={officeSaved || officeSkipped}
                      required
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={saveOfficeInfo}
                    disabled={officeSaved || officeSkipped}
                    size="large"
                  >
                    Save Office Info
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={skipOfficeInfo}
                    disabled={officeSaved || officeSkipped}
                    size="large"
                  >
                    Skip for Now
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* CONTACT DETAILS SECTION */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Contact Details"
                action={
                  <>
                    {contactSaved && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Saved"
                        color="success"
                        size="small"
                      />
                    )}
                    {contactSkipped && (
                      <Chip
                        icon={<WarningIcon />}
                        label="Skipped"
                        color="warning"
                        size="small"
                      />
                    )}
                  </>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      placeholder="Enter contact name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      error={showContactErrors && !contactForm.name}
                      disabled={contactSaved || contactSkipped}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      placeholder="Enter designation"
                      value={contactForm.designation}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, designation: e.target.value })
                      }
                      error={showContactErrors && !contactForm.designation}
                      disabled={contactSaved || contactSkipped}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="tel"
                      label="Phone"
                      placeholder="Enter phone number"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, phone: e.target.value })
                      }
                      disabled={contactSaved || contactSkipped}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="tel"
                      label="Alt Phone"
                      placeholder="Enter alternate phone"
                      value={contactForm.alt_phone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, alt_phone: e.target.value })
                      }
                      disabled={contactSaved || contactSkipped}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email"
                      placeholder="Enter email address"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      disabled={contactSaved || contactSkipped}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={saveContactInfo}
                    disabled={contactSaved || contactSkipped}
                    size="large"
                  >
                    Save Contact Info
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={skipContactInfo}
                    disabled={contactSaved || contactSkipped}
                    size="large"
                  >
                    Skip for Now
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* SALES ASSIGNMENT SECTION */}
            {userRole === 'admin' && (
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title="Sales Representative Assignment"
                  action={
                    <>
                      {assigneeSaved && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Saved"
                          color="success"
                          size="small"
                        />
                      )}
                      {assigneeSkipped && (
                        <Chip
                          icon={<WarningIcon />}
                          label="Skipped"
                          color="warning"
                          size="small"
                        />
                      )}
                    </>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You can assign a sales representative now or skip this step and assign later.
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={{ minWidth: 300 }}>
                        <InputLabel>Select Sales Representative</InputLabel>
                        <Select
                          value={selectedAssignee}
                          label="Select Sales Representative"
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          disabled={assigneeSaved || assigneeSkipped}
                        >
                          <MenuItem value="">Choose a sales representative...</MenuItem>
                          {users.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} - {user.role}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        placeholder="Enter assignment description or notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={assigneeSaved || assigneeSkipped}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={assignSalesRep}
                      disabled={assigneeSaved || assigneeSkipped}
                      size="large"
                    >
                      Assign Sales Rep
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={skipAssignee}
                      disabled={assigneeSaved || assigneeSkipped}
                      size="large"
                    >
                      Skip for Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* COMPLETION SECTION */}
            {isFormComplete() && (
              <Alert
                icon={<CelebrationIcon />}
                severity="success"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" gutterBottom>
                  🎉 Lead Created Successfully!
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2"><strong>Lead ID:</strong> {leadId}</Typography>
                  <Typography variant="body2"><strong>Company Information:</strong> ✓ Completed</Typography>
                  <Typography variant="body2"><strong>Office Details:</strong> {officeSaved ? '✓ Completed' : '⚠ Skipped'}</Typography>
                  <Typography variant="body2"><strong>Contact Information:</strong> {contactSaved ? '✓ Completed' : '⚠ Skipped'}</Typography>
                  <Typography variant="body2"><strong>Sales Assignment:</strong> {assigneeSaved ? '✓ Completed' : '⚠ Skipped'}</Typography>
                </Box>

                {(officeSkipped || contactSkipped || assigneeSkipped) && (
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Note: You can complete the skipped sections later from the leads management page.
                  </Typography>
                )}

                <Button
                  variant="contained"
                  onClick={() => navigate('/dashboard')}
                  sx={{ mt: 2 }}
                  size="large"
                >
                  Go to Dashboard
                </Button>
              </Alert>
            )}
          </Container>
        </Box>
      </Box>
  );
};

export default LeadsNewPage;