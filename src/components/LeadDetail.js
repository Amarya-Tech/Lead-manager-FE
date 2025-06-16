
import "./css/LeadDetail.css";
import { useState, useEffect, useCallback } from "react";
import apiClient from "../apicaller/APIClient.js";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
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
} from "@mui/material";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function LeadDetailsPage({ leadId, onBack }) {
    
    const userId = Cookies.get("user_id") 
    const [leadDetails, setLeadDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [saving, setSaving] = useState(false);

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
            console.log(response.data)
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
                    response = await apiClient.put(`/lead/update-lead/${leadId}`, updatedData);
                    break;
                    
                case 'contact':
                    if (updatedData.contact_details && Array.isArray(updatedData.contact_details)) {
                        const contactPromises = updatedData.contact_details.map(async (contact) => {
                            if (contact.contact_id) {
                                const { contact_id, ...contactPayload } = contact;
                                return await apiClient.put(`/lead/update-lead-contact/${leadId}/${contact.contact_id}`, contactPayload);
                            } else {
                                return await apiClient.post(`/lead/add-lead-contact/${userId}`, contact);
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
                                return await apiClient.put(`/lead/update-lead-office/${leadId}/${office.office_id}`, officePayload);
                            } else {
                                return await apiClient.post(`/lead/add-lead-office/`, office);
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
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
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
                    <button onClick={onBack} className="back-button">
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
                    <button onClick={onBack} className="back-button">
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="lead-details-page">
            <div className="lead-details-header">
                <button onClick={onBack} className="back-button">
                    ← Back to Leads
                </button>
                <h1>Lead Details</h1>
            </div>

            <div className="lead-details-container">
                <CompanySection
                    leadDetails={leadDetails}
                    isEditing={editingSection === 'company'}
                    onEdit={() => handleEditSection('company')}
                    onCancel={handleCancelEdit}
                    onSave={(data) => handleSaveSection('company', data)}
                    saving={saving}
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
        insured_amount: '',
        export_value: '',
        status: ''
    });

    useEffect(() => {
        setFormData({
            company_name: leadDetails.company_name || '',
            product: leadDetails.product || '',
            industry_type: leadDetails.industry_type || '',
            insured_amount: leadDetails.insured_amount || '',
            export_value: leadDetails.export_value || '',
            status: leadDetails.status || ''
        });
    }, [leadDetails]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.company_name.trim()) {
            toast.error('Company name is required');
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
            fullWidth
          />

          <TextField
            label="Product"
            value={formData.product}
            onChange={(e) => handleInputChange('product', e.target.value)}
            fullWidth
          />

          <TextField
            label="Industry Type"
            value={formData.industry_type}
            onChange={(e) => handleInputChange('industry_type', e.target.value)}
            fullWidth
          />

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

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="prospect">Prospect</MenuItem>
              <MenuItem value="active prospect">Active Prospect</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="expired lead">Expired Lead</MenuItem>
              <MenuItem value="expired prospect">Expired Prospect</MenuItem>
            </Select>
          </FormControl>

          <Box className="form-actions" display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
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
          <Typography className="detail-item"><strong>Insured Amount:</strong> {leadDetails.insured_amount || 'N/A'}</Typography>
          <Typography className="detail-item"><strong>Export Value:</strong> {leadDetails.export_value || 'N/A'}</Typography>
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
        setContacts(initialContacts.length > 0 ? initialContacts : [{
            name: '',
            email: '',
            phone: '',
            alt_phone: ''
        }]);
    }, [leadDetails.contact_details]);

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...contacts];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        setContacts(updatedContacts);
    };

    const addNewContact = () => {
        setContacts([...contacts, {
            lead_id: leadId,
            name: '',
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
            if (!contact.name?.trim()) {
                alert(`Contact ${i + 1}: Name is required`);
                return false;
            }
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
                  label="Name *"
                  value={contact.name || ''}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  required
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

    useEffect(() => {
        const initialOffices = leadDetails.office_details || [];
        setOffices(initialOffices.length > 0 ? initialOffices : [{
            address: '',
            city: '',
            district: '',
            country: '',
            postal_code: ''
        }]);
    }, [leadDetails.office_details]);

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
            district: '',
            country: '',
            postal_code: ''
        }]);
    };

    const removeOffice = (index) => {
        if (offices.length <= 1) {
            alert('At least one office is required');
            return;
        }
        const updatedOffices = offices.filter((_, i) => i !== index);
        setOffices(updatedOffices);
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
        onSave({ office_details: offices });
    };

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
                <TextField
                  label="City"
                  value={office.city || ''}
                  onChange={(e) => handleOfficeChange(index, 'city', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="District"
                  value={office.district || ''}
                  onChange={(e) => handleOfficeChange(index, 'district', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Country"
                  value={office.country || ''}
                  onChange={(e) => handleOfficeChange(index, 'country', e.target.value)}
                  fullWidth
                />
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
                <Typography><strong>District:</strong> {office.district || 'N/A'}</Typography>
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