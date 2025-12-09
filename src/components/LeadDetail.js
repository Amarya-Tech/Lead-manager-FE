import "./css/LeadDetail.css";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Country, State, City } from "country-state-city";
import apiClient from "../apicaller/APIClient.js";
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
  Grid,
} from "@mui/material";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import ExpireLeadDialog from "../components/ExpireLeadComponent.js";
import ConvertLeadDialog from "../components/ConvertLeadComponent.js";
import { cleanPayload } from "../utils/functions.js";
import { useAuthStore } from "../apicaller/AuthStore.js";

export default function LeadDetailsPage() {

  const { userId, role} = useAuthStore();
  const userRole = role;
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeSaved, setAssigneeSaved] = useState(false);
  const [assigneeSkipped, setAssigneeSkipped] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openExpireDialog, setOpenExpireDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [leadLogs, setLeadLogs] = useState([]);

  const fetchLeadDetails = useCallback(async () => {
    if (!leadId) {
      setError("Invalid lead ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/lead/get-lead-detail/${leadId}`);
      const leadData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      setLeadDetails(leadData || null);
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      setError("Failed to load lead details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get('/user/fetch-active-user-list');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        console.error('Failed to fetch users:', response.data);
        toast.error('Failed to load sales representatives');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const backendMessage = error.response?.data?.errors[0].msg || 'Failed to lead sales representative';
      toast.error(backendMessage);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const assignSalesRep = async () => {
    if (!leadId) {
      toast.error('Please save company information first');
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

      const response = await apiClient.post(`/lead-com/update-assignee/${userId}`, requestBody);

      if (response.data.success) {
        setAssigneeSaved(true);
        toast.success('Sales representative assigned successfully');
      } else {
        console.error('Invalid assign response:', response.data);
        toast.error('Failed to assign sales representative');
      }
    } catch (error) {
      const backendMessage = error.response?.data?.errors[0].msg|| 'Failed to assign sales representative';
      toast.error(backendMessage);
      console.error('Failed to assign sales rep:', error);
    }
  };

  const skipAssignment = () => {
    setAssigneeSkipped(true);
    toast.info('Sales representative assignment skipped');
  };

  useEffect(() => {
    fetchUsers();

    if (leadDetails?.assignee_id) {
      setSelectedAssignee(leadDetails.assignee_id);
      setAssigneeSaved(true);
    }
    if (leadDetails?.assignment_description) {
      setDescription(leadDetails.assignment_description);
    }
  }, [fetchUsers, leadDetails]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  const handleEditSection = (section) => {
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSaveSection = async (section, updatedData) => {
    if (saving) return;
    setSaving(true);
    try {
      let response;

      switch (section) {
        case 'company':
          const cleanedCompanyData = cleanPayload(updatedData);
          response = await apiClient.put(`/lead/update-lead/${leadId}`, cleanedCompanyData);
          break;

        case 'contact':
          if (updatedData.contact_details && Array.isArray(updatedData.contact_details)) {
            const contactPromises = updatedData.contact_details.map(async (contact) => {
              if (contact.contact_id) {
                const { contact_id, ...contactPayload } = contact;
                const cleanedContactPayload = cleanPayload(contactPayload);
                return await apiClient.put(`/lead/update-lead-contact/${leadId}/${contact.contact_id}`, cleanedContactPayload);
              } else {
                const cleanedContact = cleanPayload(contact);
                return await apiClient.post(`/lead/add-lead-contact/${userId}`, cleanedContact);
              }
            });
            await Promise.all(contactPromises);
          }
          break;

        case 'office':
          if (updatedData.office_details && Array.isArray(updatedData.office_details)) {
            const officePromises = updatedData.office_details.map(async (office) => {
              if (office.office_id) {
                const { office_id, ...officePayload } = office;
                const cleanedOfficePayload = cleanPayload(officePayload);
                return await apiClient.put(`/lead/update-lead-office/${leadId}/${office.office_id}`, cleanedOfficePayload);
              } else {
                const cleanedOffice = cleanPayload(office);
                return await apiClient.post(`/lead/add-lead-office/`, cleanedOffice);
              }
            });
            await Promise.all(officePromises);
          }
          break;

        default:
          throw new Error(`Unknown section: ${section}`);
      }

      setEditingSection(null);

      await fetchLeadDetails();
      toast.success('Updated successfully');

    } catch (error) {
      console.error(`Failed to update ${section}:`, error);
      const backendMessage = error.response?.data?.errors[0].msg || 'Failed to update';
      toast.error(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleExpire = () => {
    setOpenExpireDialog(true);
  };

  const handleConvertSubmit = async ({ product, comment }) => {
    const action =
      leadDetails.status === "lead"
        ? "TO_PROSPECT"
        : leadDetails.status === "prospect"
          ? "TO_ACTIVE_PROSPECT"
          : leadDetails.status === "active prospect"
            ? "TO_CUSTOMER"
            : "";
            
    try {
      const commentRes = await apiClient.post(`/lead-com/add-comments/${userId}/${leadId}`, {
        comment, action
      });

      if (!commentRes.data.success) {
        console.error("Failed to add comment");
        return;
      }

      let nextStatus = "";
      if (leadDetails.status === "lead") nextStatus = "prospect";
      else if (leadDetails.status === "prospect") nextStatus = "active prospect";
      else if (leadDetails.status === "active prospect") nextStatus = "customer";

      const payload = cleanPayload({ 
        status: nextStatus,
        suitable_product: product,
      });

      const updateRes = await apiClient.put(`/lead/update-lead/${leadId}`, payload);

      if (updateRes.data.success) {
        fetchLeadDetails();
      } else {
        console.error("Failed to update lead status");
      }
    } catch (error) {
      console.error("Error in status conversion:", error);
    }
  };

  const handleViewLogs = (leadId) => {
    navigate(`/leads/view-lead-logs/${leadId}`);
  };

  if (loading) {
    return (
      <div className="lead-details-page">
        <div className="loading-container">
          <p>Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lead-details-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!leadDetails) {
    return (
      <div className="lead-details-page">
        <div className="error-container">
          <p>Lead details not found.</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-details-page">
      <div className="lead-details-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Leads
        </button>

        <h1>Lead Details</h1>
        {!["expired lead", "customer"].includes(leadDetails.status?.toLowerCase()) && (
          <div className="action-buttons">
            <Button
              variant="outlined"
              className="convert-button"
              onClick={() => setOpenConvertDialog(true)}
            >
              {leadDetails.status === "lead"
                ? "Convert to Prospect"
                : leadDetails.status === "prospect"
                  ? "Convert to Active Prospect"
                  : leadDetails.status === "active prospect"
                    ? "Convert to Customer"
                    : "Convert"}
            </Button>

            <Button
              variant="outlined"
              color="error"
              className="expire-button"
              onClick={handleExpire}
            >
              Expire Lead
            </Button>
          </div>
        )}
      </div>
      <ExpireLeadDialog
        open={openExpireDialog}
        onClose={() => setOpenExpireDialog(false)}
        leadId={leadId}
        userId={userId}
        onSuccess={(newLog) => {
          setLeadLogs((prev) => [newLog, ...prev]);
          fetchLeadDetails()
        }}
      />
      <ConvertLeadDialog
        open={openConvertDialog}
        onClose={() => setOpenConvertDialog(false)}
        onSubmit={handleConvertSubmit}
        status={leadDetails.status}
      />

      <div className="lead-details-container">
         <Button variant="contained" color="primary" size="small" onClick={() => handleViewLogs(leadId)} sx ={{alignItems: "right", ml: "auto" }}>
          Comments
        </Button>
        <CompanySection 
          leadDetails={leadDetails}
          isEditing={editingSection === 'company'}
          onEdit={() => handleEditSection('company')}
          onCancel={handleCancelEdit}
          onSave={(data) => handleSaveSection('company', data)}
          saving={saving}
        />

        <SalesAssignmentSection
          leadId={leadId}
          leadDetails={leadDetails}
          isEditing={editingSection === 'sales'}
          onEdit={() => handleEditSection('sales')}
          onCancel={handleCancelEdit}
          onSave={() => { }}
          saving={saving}
          users={users}
          loadingUsers={loadingUsers}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          description={description}
          setDescription={setDescription}
          assigneeSaved={assigneeSaved}
          assigneeSkipped={assigneeSkipped}
          assignSalesRep={assignSalesRep}
          skipAssignment={skipAssignment}
          userRole={userRole}
        />

        <ContactSection
          leadDetails={leadDetails}
          leadId={leadId}
          isEditing={editingSection === 'contact'}
          onEdit={() => handleEditSection('contact')}
          onCancel={handleCancelEdit}
          onSave={(data) => handleSaveSection('contact', data)}
          saving={saving}
        />

        <OfficeSection
          leadDetails={leadDetails}
          leadId={leadId}
          isEditing={editingSection === 'office'}
          onEdit={() => handleEditSection('office')}
          onCancel={handleCancelEdit}
          onSave={(data) => handleSaveSection('office', data)}
          saving={saving}
        />
      </div>
    </div>
  );
}

function CompanySection({ leadDetails, isEditing, onEdit, onCancel, onSave, saving }) {
  const [formData, setFormData] = useState({
    company_name: '',
    product: '',
    industry_type: '',
    parent_company_id: '',
    insured_amount: '',
    export_value: '',
    status: ''
  });

  const [industryTypes, setIndustryTypes] = useState([]);
  const [loadingIndustryTypes, setLoadingIndustryTypes] = useState(false);
  const [userCompanies, setUserCompanies] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const parentCompany = userCompanies.find(
      (company) => company.parent_company_name === leadDetails.parent_company_name
    );
    setFormData({
      company_name: leadDetails.company_name || '',
      product: leadDetails.product || '',
      industry_type: leadDetails.industry_type || '',
      parent_company_id: parentCompany?.id || '',
      insured_amount: leadDetails.insured_amount || '',
      export_value: leadDetails.export_value || '',
      status: leadDetails.status || ''
    });
  }, [leadDetails, userCompanies]);

  useEffect(() => {
    if (isEditing) {
      fetchIndustryTypes();
      fetchUserCompanies();
    }
  }, [isEditing]);

  const fetchIndustryTypes = async () => {
    setLoadingIndustryTypes(true);
    try {
      const response = await apiClient.get('/lead/fetch-industry-type');
      console.log('Industry types response:', response.data);
      if (response.data && response.data.success && response.data.data) {
        setIndustryTypes(response.data.data);
      } else {
        console.error('Failed to fetch industry types:', response.data);
        toast.error('Failed to fetch industry types');
      }
    } catch (error) {
      console.error('Error fetching industry types:', error);
      const backendMessage = error.response?.data?.errors[0].msg || 'Failed to fetch industry types';
      toast.error(backendMessage);
    } finally {
      setLoadingIndustryTypes(false);
    }
  };

   const fetchUserCompanies = async () => {
      try {
        const response = await apiClient.get(`/lead/fetch-company-brands`);

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setUserCompanies(response.data.data);
        } else {
          setUserCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching company brands:", error);
        setUserCompanies([]);
      }
    };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setShowErrors(true);
    if (!formData.company_name.trim() || !formData.parent_company_id) {
      toast.error('Company related fields is required');
      return;
    }
    onSave(formData);
  };

  return (
    <Box className="details-section">
      <Box className="section-header" display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Company & Product Information</Typography>
        {!isEditing && (
          <Button
            variant="outlined"
            onClick={onEdit}
            disabled={saving}
            className="edit-button"
          >
            Edit
          </Button>
        )}
      </Box>

      {isEditing ? (
        <Box className="edit-form" display="flex" flexDirection="column" gap={2} mt={2}>
          <TextField
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            required
            fullWidth error={!formData.company_name && showErrors}
          />

          <TextField
            label="Product"
            value={formData.product}
            onChange={(e) => handleInputChange('product', e.target.value)}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Industry Type</InputLabel>
            <Select
              value={formData.industry_type}
              onChange={(e) => handleInputChange('industry_type', e.target.value)}
              label="Industry Type"
              disabled={loadingIndustryTypes}
            >
              <MenuItem value="">
                {loadingIndustryTypes ? 'Loading...' : 'Select Industry Type'}
              </MenuItem>
              {industryTypes.map((industry) => (
                <MenuItem
                  key={industry.id || industry.industry_name}
                  value={industry.industry_name}
                >
                  {industry.industry_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required error={!formData.parent_company_id && showErrors}>
            <InputLabel>Managing Brand</InputLabel>
            <Select
              value={formData.parent_company_id}
              onChange={(e) => handleInputChange('parent_company_id', e.target.value)}
              label="Managing Brand"
              required
            >
             <MenuItem value="">Select managing brand</MenuItem>
              {userCompanies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.parent_company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Insured Amount"
            type="number"
            value={formData.insured_amount}
            onChange={(e) => handleInputChange('insured_amount', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
          />

          <TextField
            label="Export Value"
            type="number"
            value={formData.export_value}
            onChange={(e) => handleInputChange('export_value', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
          />

          {/* <TextField
            label="Status"
            type="string"
            value={formData.status}
            InputProps={{ readOnly: true }}
            fullWidth
          /> */}

          <Box className="form-actions" display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || loadingIndustryTypes}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={saving}
              className="cancel-button"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="view-content" mt={2}>
          <Typography className="detail-item"><strong>Company Name:</strong> {leadDetails.company_name || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Product:</strong> {leadDetails.product || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Industry Type:</strong> {leadDetails.industry_type || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Managing Brand:</strong> {leadDetails.parent_company_name || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Insured Amount:</strong> {leadDetails.insured_amount || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Export Value:</strong> {leadDetails.export_value || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Suitable Product:</strong> {leadDetails.suitable_product || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Status:</strong> {leadDetails.status || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Created Date:</strong> {leadDetails.created_date || 'N/A'}</Typography>
        </Box>
      )}
    </Box>
  );
}

// Contact Section Component
function ContactSection({ leadDetails, leadId, isEditing, onEdit, onCancel, onSave, saving }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const initialContacts = leadDetails.contact_details || [];

    const isBlankContact = (contact) =>
      !contact.name?.trim() &&
      !contact.designation?.trim() &&
      !contact.email?.trim() &&
      !contact.phone?.toString().trim() &&
      !contact.alt_phone?.toString().trim();

    if (
      initialContacts.length === 0 ||
      (initialContacts.length === 1 && isBlankContact(initialContacts[0]))
    ) {
      setContacts([{
        lead_id: leadId,
        name: '',
        designation: '',
        email: '',
        phone: '',
        alt_phone: ''
      }]);
    } else {
      setContacts(initialContacts);
    }
  }, [leadDetails.contact_details, leadId]);

  // useEffect(() => {
  //     const initialContacts = leadDetails.contact_details || [];
  //     setContacts(initialContacts.length > 0 ? initialContacts : [{
  //         name: '',
  //         designation: '',
  //         email: '',
  //         phone: '',
  //         alt_phone: ''
  //     }]);
  // }, [leadDetails.contact_details]);

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setContacts(updatedContacts);
  };

  const addNewContact = () => {
    setContacts([...contacts, {
      lead_id: leadId,
      name: '',
      designation: '',
      email: '',
      phone: '',
      alt_phone: ''
    }]);
  };

  const removeContact = (index) => {
    if (contacts.length <= 1) {
      alert('At least one contact is required');
      return;
    }
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  const validateContacts = () => {
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      //contact isoptional now
      // if (!contact.name?.trim()) {
      //   alert(`Contact ${i + 1}: Name is required`);
      //   return false;
      // }
      if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
        alert(`Contact ${i + 1}: Please enter a valid email address`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateContacts()) return;
    onSave({ contact_details: contacts });
  };

  return (
    <Box className="details-section" mt={2}>
      <Box className="section-header" display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Contact Details</Typography>
        {!isEditing && (
          <Button variant="outlined"
            onClick={onEdit}
            disabled={saving}
            className="edit-button">
            Edit
          </Button>
        )}
      </Box>

      {isEditing ? (
        <Box className="edit-form" mt={2} display="flex" flexDirection="column" gap={3}>
          {contacts.map((contact, index) => (
            <Box key={contact.contact_id || index} className="contact-edit-block" p={2} border="1px solid #ddd" borderRadius={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Contact {index + 1}</Typography>
                {contacts.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeContact(index)}
                    disabled={saving}
                    size="small"
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>
              <Box mt={2} display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
                <TextField
                  label="Name"
                  value={contact.name || ''}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Designation"
                  value={contact.designation || ''}
                  onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={contact.email || ''}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={contact.phone || ''}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Alt Phone"
                  value={contact.alt_phone || ''}
                  onChange={(e) => handleContactChange(index, 'alt_phone', e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>
          ))}

          <Box>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={addNewContact}
              disabled={saving}
              variant="outlined"
              color="primary"
            >
              Add New Contact
            </Button>
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="view-content" mt={2}>
          {contacts && contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <Box key={contact.contact_id || index} className="contact-block" mb={3}>
                <Typography variant="subtitle1">Contact {index + 1}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography className="detail-item"><strong>Name:</strong> {contact.name || 'N/A'}</Typography>
                <Typography className="detail-item"><strong>Designation:</strong> {contact.designation || 'N/A'}</Typography>
                <Typography className="detail-item"><strong>Email:</strong> {contact.email || 'N/A'}</Typography>
                <Typography className="detail-item"><strong>Phone:</strong> {contact.phone || 'N/A'}</Typography>
                <Typography className="detail-item"><strong>Alt Phone:</strong> {contact.alt_phone || 'N/A'}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No contact details available.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// Office Section Component
function OfficeSection({ leadDetails, leadId, isEditing, onEdit, onCancel, onSave, saving }) {
  const [offices, setOffices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [statesList, setStatesList] = useState({});
  const [citiesList, setCitiesList] = useState({});

  
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    const initialOffices = leadDetails.office_details || [];

    const isBlankOffice = (office) =>
      !office.address?.trim() &&
      !office.city?.trim() &&
      !office.state?.trim() &&
      !office.country?.trim() &&
      !office.postal_code?.trim();

    if (
      initialOffices.length === 0 ||
      (initialOffices.length === 1 && isBlankOffice(initialOffices[0]))
    ) {
      setOffices([{
        lead_id: leadId,
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        countryCode: '',
        stateCode: ''
      }]);
    } else {
        const processedOffices = initialOffices.map(office => {
        const countryObj = countries.find(c => c.name === office.country);
        const countryCode = countryObj?.isoCode || '';
        let stateCode = '';
        if (countryCode && office.state) {
          const states = State.getStatesOfCountry(countryCode);
          const stateObj = states.find(s => s.name === office.state);
          stateCode = stateObj?.isoCode || '';
        }
        return {
          ...office,
          countryCode,
          stateCode
        };
      });
      setOffices(processedOffices);
    }
  }, [leadDetails.office_details, leadId, countries]);

  const handleCountryChange = (index, countryCode, countryName) => {
    const updatedOffices = [...offices];
    updatedOffices[index] = {
      ...updatedOffices[index],
      country: countryName,
      countryCode: countryCode,
      state: '',
      stateCode: '',
      city: ''
    };
    setOffices(updatedOffices);

    const states = State.getStatesOfCountry(countryCode);
    setStatesList(prev => ({
      ...prev,
      [index]: states
    }));

    setCitiesList(prev => ({
      ...prev,
      [index]: []
    }));
  };

  const handleStateChange = (index, stateCode, stateName) => {
    const updatedOffices = [...offices];
    updatedOffices[index] = {
      ...updatedOffices[index],
      state: stateName,
      stateCode: stateCode,
      city: ''
    };
    setOffices(updatedOffices);
    const cities = City.getCitiesOfState(updatedOffices[index].countryCode, stateCode);
    setCitiesList(prev => ({
      ...prev,
      [index]: cities
    }));
  };

  const handleCityChange = (index, cityName) => {
    const updatedOffices = [...offices];
    updatedOffices[index] = {
      ...updatedOffices[index],
      city: cityName
    };
    setOffices(updatedOffices);
  };

  const handleOfficeChange = (index, field, value) => {
      const updatedOffices = [...offices];
      updatedOffices[index] = { ...updatedOffices[index], [field]: value };
    setOffices(updatedOffices);
    };

  const addNewOffice = () => {
    setOffices([...offices, {
      lead_id: leadId,
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      countryCode: '',
      stateCode: ''
    }]);
  };

  const removeOffice = (index) => {
    if (offices.length <= 1) {
      alert('At least one office is required');
      return;
    }
    const updatedOffices = offices.filter((_, i) => i !== index);
    setOffices(updatedOffices);
    setStatesList(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });

    setCitiesList(prev => {
      const newCities = { ...prev };
      delete newCities[index];
      return newCities;
    });
  };

  const validateOffices = () => {
    for (let i = 0; i < offices.length; i++) {
      const office = offices[i];
      if (!office.address?.trim()) {
        alert(`Office ${i + 1}: Address is required`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateOffices()) return;
    const officesToSave = offices.map(office => {
      const { countryCode, stateCode, ...officeData } = office;
      return officeData;
    });
    onSave({ office_details: officesToSave });
  };

  // Initialize states and cities for existing offices when editing starts

  useEffect(() => {
    if (isEditing && offices.length > 0) {
      const newStatesList = {};
      const newCitiesList = {};

      offices.forEach((office, index) => {
        if (office.countryCode) {
          const states = State.getStatesOfCountry(office.countryCode);
          newStatesList[index] = states;
          if (office.stateCode) {
            const cities = City.getCitiesOfState(office.countryCode, office.stateCode);
            newCitiesList[index] = cities;
          }
        }
      });
      setStatesList(newStatesList);
      setCitiesList(newCitiesList);
    }
  }, [isEditing, offices]);

  return (
    <Box className="details-section" mt={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Office Details</Typography>
        {!isEditing && (
          <Button variant="outlined"
            onClick={onEdit}
            disabled={saving}
            className="edit-button">
            Edit
          </Button>
        )}
      </Box>

      {isEditing ? (
        <Box mt={2} display="flex" flexDirection="column" gap={3}>
          {offices.map((office, index) => (
            <Box
              key={office.office_id || index}
              p={2}
              border="1px solid #ddd"
              borderRadius={2}
              className="office-edit-block"
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Office {index + 1}</Typography>
                {offices.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeOffice(index)}
                    disabled={saving}
                    size="small"
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>

              <Box mt={2} display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
                <TextField
                  label="Address *"
                  value={office.address || ''}
                  onChange={(e) => handleOfficeChange(index, 'address', e.target.value)}
                  required
                  multiline
                  minRows={3}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={office.countryCode || ''}
                    onChange={(e) => {
                      const selectedCountry = countries.find(c => c.isoCode === e.target.value);
                      handleCountryChange(index, e.target.value, selectedCountry?.name || '');
                    }}
                    label="Country"
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!office.countryCode}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={office.stateCode || ''}
                    onChange={(e) => {
                      const selectedState = (statesList[index] || []).find(s => s.isoCode === e.target.value);
                      handleStateChange(index, e.target.value, selectedState?.name || '');
                    }}
                    label="State"
                  >
                    {(statesList[index] || []).map((state) => (
                      <MenuItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!office.stateCode}>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={office.city || ''}
                    onChange={(e) => handleCityChange(index, e.target.value)}
                    label="City"
                  >
                    {(citiesList[index] || []).map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Postal Code"
                  value={office.postal_code || ''}
                  onChange={(e) => handleOfficeChange(index, 'postal_code', e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>
          ))}

          <Box>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={addNewOffice}
              disabled={saving}
            >
              Add New Office
            </Button>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="view-content" mt={2}>
          {offices && offices.length > 0 ? (
            offices.map((office, index) => (
              <Box key={office.office_id || index} mb={3} className="office-block">
                <Typography variant="subtitle1">Office {index + 1}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography><strong>Address:</strong> {office.address || 'N/A'}</Typography>
                <Typography><strong>City:</strong> {office.city || 'N/A'}</Typography>
                <Typography><strong>State:</strong> {office.state || 'N/A'}</Typography>
                <Typography><strong>Country:</strong> {office.country || 'N/A'}</Typography>
                <Typography><strong>Postal Code:</strong> {office.postal_code || 'N/A'}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No office details available.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// Sales Assignement Component
function SalesAssignmentSection({
  leadDetails,
  isEditing,
  onEdit,
  onCancel,
  assignSalesRep,
  saving,
  users,
  loadingUsers,
  selectedAssignee,
  setSelectedAssignee,
  description,
  setDescription,
  assigneeSaved,
  assigneeSkipped,
  userRole
}) {
  const hasAssignment = assigneeSaved || (leadDetails?.assignee_id && !assigneeSkipped);

  return (
    <Box className="details-section" mt={3}>
      <Box className="section-header" display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Sales Representative Assignment</Typography>

        {userRole === 'admin' || userRole === 'super_admin' && !isEditing && !hasAssignment && (
          <Button
            variant="outlined"
            onClick={onEdit}
            disabled={saving}
          >
            Assign Representative
          </Button>
        )}
        {userRole === 'admin' || userRole === 'super_admin' && !isEditing && hasAssignment && (
          <Tooltip title="Edit Assignment">
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {isEditing ? (
        <Box mt={2} display="flex" flexDirection="column" gap={3}>
          <Box p={2} border="1px solid #ddd" borderRadius={2}>
            <Typography variant="subtitle1" mb={2}>Assign Sales Representative</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sales Representative *</InputLabel>
                  <Select
                    value={selectedAssignee}
                    label="Sales Representative *"
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    disabled={loadingUsers}
                  >
                    <MenuItem value="">Select a representative...</MenuItem>
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
                  placeholder="Enter assignment notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={assignSalesRep}
              disabled={!selectedAssignee || loadingUsers}
            >
              Save Assignment
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="view-content" mt={2}>
          {hasAssignment ? (
            <>
              <Typography className="detail-item">
                <strong>Assigned Representative:</strong> {leadDetails?.assigned_person || 'N/A'}
              </Typography>
              <Typography className="detail-item">
                <strong>Assignment Notes:</strong> {leadDetails?.assigned_description || 'N/A'}
              </Typography>
              <Typography className="detail-item" display="flex" alignItems="center" gap={1}>
                <strong>Status:</strong>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Assigned"
                  color="success"
                  size="small"
                />
              </Typography>
            </>
          ) : assigneeSkipped ? (
            <>
              <Typography className="detail-item" display="flex" alignItems="center" gap={1}>
                <strong>Status:</strong>
                <Chip
                  icon={<WarningIcon />}
                  label="Skipped"
                  color="warning"
                  size="small"
                />
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Sales representative assignment was skipped.
              </Typography>
              {userRole === 'admin' || userRole === 'super_admin'&& (
                <Button
                  variant="outlined"
                  onClick={onEdit}
                  sx={{ mt: 2 }}
                >
                  Assign Representative Now
                </Button>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                No sales representative has been assigned yet.
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}