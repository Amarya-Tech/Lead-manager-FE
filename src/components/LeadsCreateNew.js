import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "./SideBar.js";
import './css/LeadsCreateNew.css';
import FormInput from '../components/FormInput.js';

const LeadsNewPage = () => {
  const navigate = useNavigate();
  const userId = Cookies.get("user_id") 

  const [leadId, setLeadId] = useState(null);
  const [officeSaved, setOfficeSaved] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [offices, setOffices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeSaved, setAssigneeSaved] = useState(false);
  const [assigneeSkipped, setAssigneeSkipped] = useState(false);

  // Error state tracking
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
    district: '',
    country: '',
    postal_code: '',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    alt_phone: '',
    email: '',
  });

  // Validation functions
  const validateCompanyForm = () => {
    return companyForm.company_name.trim() !== '' && companyForm.product.trim() !== '';
  };

  const validateOfficeForm = () => {
    return officeForm.address.trim() !== '' && 
           officeForm.city.trim() !== '' && 
           officeForm.district.trim() !== '' && 
           officeForm.country.trim() !== '' && 
           officeForm.postal_code.trim() !== '';
  };

  const validateContactForm = () => {
    return contactForm.name.trim() !== '';
  };

  // Fetch users list when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/user/fetch-active-user-list');
      console.log(response.data)
      
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

  const createLead = async () => {
    setShowCompanyErrors(true);
    
    if (!validateCompanyForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Filter out empty optional fields
      const requestBody = {
        company_name: companyForm.company_name,
        product: companyForm.product,
        ...(companyForm.industry_type && { industry_type: companyForm.industry_type }),
        ...(companyForm.export_value && { export_value: companyForm.export_value }),
        ...(companyForm.insured_amount && { insured_amount: companyForm.insured_amount }),
      };

      const response = await apiClient.post(`/lead/create-lead/${userId}`, requestBody);
      const { success, message, data } = response.data || {};
      setLeadId(data.lead_id);
    } catch (error) {
      console.error('Failed to create lead:', error);
      const backendMessage = error.response.data.message;
      toast.error(backendMessage);
    }
  };

  const saveOffice = async () => {
    setShowOfficeErrors(true);
    
    if (!validateOfficeForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await apiClient.post(`/lead/add-lead-office`, {
        lead_id: leadId,
        ...officeForm,
      });

      if (response.data.success) {
        setOffices([...offices, officeForm]);
        setOfficeSaved(true);
        setOfficeForm({
          address: '',
          city: '',
          district: '',
          country: '',
          postal_code: '',
        });
        setShowOfficeErrors(false);
      } else {
        console.error('Invalid save office response:', response.data);
      }
    } catch (error) {
      const backendMessage = error.response.data.message;
      toast.error(backendMessage);
      console.error('Failed to save office:', error);
    }
  };

  const saveContact = async () => {
    setShowContactErrors(true);
    
    if (!validateContactForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Filter out empty optional fields
      const requestBody = {
        lead_id: leadId,
        name: contactForm.name, // Required field
        ...(contactForm.phone && { phone: contactForm.phone }),
        ...(contactForm.alt_phone && { alt_phone: contactForm.alt_phone }),
        ...(contactForm.email && { email: contactForm.email }),
      };

      const response = await apiClient.post(`/lead/add-lead-contact/${userId}`, requestBody);

      if (response.data.success) {
        setContacts([...contacts, contactForm]);
        setContactSaved(true);
        setContactForm({
          name: '',
          phone: '',
          alt_phone: '',
          email: '',
        });
        setShowContactErrors(false);
      } else {
        console.error('Invalid save contact response:', response.data);
      }
    } catch (error) {
      const backendMessage = error.response.data.message;
      toast.error(backendMessage);
      console.error('Failed to save contact:', error);
    }
  };

  const assignSalesRep = async () => {
    if (!selectedAssignee) {
      toast.error('Please select a sales representative');
      return;
    }

    try {
      // Filter out empty description field
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
    setAssigneeSkipped(true);
    toast.info('Sales representative assignment skipped. You can assign later from the leads list.');
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <div className="new-lead-container">
          <h2>Add Lead</h2>

          {/* STEP 1 - COMPANY FORM */}
          {!leadId && (
            <div className="form-section">
              <h3>Basic Lead Information</h3>
              
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <FormInput
                  type="text"
                  placeholder="Enter company name"
                  value={companyForm.company_name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, company_name: e.target.value })
                  }
                  showErrors={showCompanyErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Product *</label>
                <FormInput
                  type="text"
                  placeholder="Enter Product"
                  value={companyForm.product}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, product: e.target.value })
                  }
                  showErrors={showCompanyErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  value={companyForm.industry_type}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, industry_type: e.target.value })
                  }
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Energy">Energy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Export Value</label>
                <input
                  type="number"
                  placeholder="Enter export value"
                  value={companyForm.export_value}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, export_value: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Insured Amount</label>
                <input
                  type="number"
                  placeholder="Enter insured amount"
                  value={companyForm.insured_amount}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, insured_amount: e.target.value })
                  }
                />
              </div>

              <button onClick={createLead} className="primary-button">
                Save & Continue to Offices
              </button>
            </div>
          )}

          {/* STEP 2 - OFFICE FORM */}
          {leadId && !officeSaved && (
            <div className="form-section">
              <h3>Lead Offices</h3>
              
              <div className="form-group">
                <label className="form-label">Address *</label>
                <FormInput
                  type="text"
                  placeholder="Enter address"
                  value={officeForm.address}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, address: e.target.value })
                  }
                  showErrors={showOfficeErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <FormInput
                  type="text"
                  placeholder="Enter city"
                  value={officeForm.city}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, city: e.target.value })
                  }
                  showErrors={showOfficeErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <FormInput
                  type="text"
                  placeholder="Enter district"
                  value={officeForm.district}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, district: e.target.value })
                  }
                  showErrors={showOfficeErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country *</label>
                <FormInput
                  type="text"
                  placeholder="Enter country"
                  value={officeForm.country}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, country: e.target.value })
                  }
                  showErrors={showOfficeErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code *</label>
                <FormInput
                  type="text"
                  placeholder="Enter postal code"
                  value={officeForm.postal_code}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, postal_code: e.target.value })
                  }
                  showErrors={showOfficeErrors}
                />
              </div>

              <button onClick={saveOffice} className="primary-button">
                Save Office & Continue to Contacts
              </button>

            </div>
          )}

          {/* STEP 3 - CONTACT FORM */}
          {leadId && officeSaved && !contactSaved && (
            <div className="form-section">
              <h3>Contact Details</h3>
              
              <div className="form-group">
                <label className="form-label">Name *</label>
                <FormInput
                  type="text"
                  placeholder="Enter contact name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  showErrors={showContactErrors}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alt Phone</label>
                <input
                  type="tel"
                  placeholder="Enter alternate phone"
                  value={contactForm.alt_phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, alt_phone: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                />
              </div>

              <button onClick={saveContact} className="primary-button">
                Save Contact & Continue to Assignment
              </button>
            </div>
          )}

          {/* STEP 4 - ASSIGN SALES REP (OPTIONAL) */}
          {leadId && officeSaved && contactSaved && !assigneeSaved && !assigneeSkipped && (
            <div className="form-section">
              <h3>Assign Sales Representative (Optional)</h3>
              <p className="optional-note">You can assign a sales representative now or skip this step and assign later.</p>
              
              <div className="form-group">
                <label className="form-label">Select Sales Representative</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="">Choose a sales representative...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  placeholder="Enter assignment description or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="button-group">
                <button onClick={assignSalesRep} className="primary-button">
                  Assign Sales Representative
                </button>
                <button onClick={skipAssignee} className="secondary-button">
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          {leadId && (
            <div className="summary-section">
              <h4>Lead Creation Progress:</h4>
              <p>✓ Lead ID: {leadId}</p>
              <p>✓ Offices Added: {offices.length}</p>
              <p>✓ Contacts Added: {contacts.length}</p>
              {assigneeSaved && (
                <p>✓ Sales Representative Assigned</p>
              )}
              {assigneeSkipped && (
                <p>⚠ Sales Representative Assignment Skipped</p>
              )}
              
              {(assigneeSaved || assigneeSkipped) && (
                <div className="completion-section">
                  <h4>🎉 Lead Created Successfully!</h4>
                  {assigneeSkipped && (
                    <p className="skip-note">
                      Note: You can assign a sales representative later from the leads management page.
                    </p>
                  )}
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="secondary-button"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsNewPage;