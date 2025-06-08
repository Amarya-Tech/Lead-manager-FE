// src/pages/LeadsNewPage.jsx
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiClient from "../apicaller/APIClient.js";
import './css/LeadsCreateNew.css'

const LeadsNewPage = () => {
  const navigate = useNavigate();
    const userId = Cookies.get("user_id")

  const [leadId, setLeadId] = useState(null);
  const [officeSaved, setOfficeSaved] = useState(false);
  const [offices, setOffices] = useState([]);
  const [contacts, setContacts] = useState([]);

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

  const createLead = async () => {
    try {
      const response = await apiClient.post(`/lead/create-lead/${userId}`, companyForm);

        console.log('🎯 createLead response:', response);
        const { success, message, data } = response.data || {};

        toast.success(message || 'Lead created');
        setLeadId(data.lead_idid);
        
    } catch (error) {
      console.error('Failed to create lead:', error);
      const backendMessage = error.response.data.message;
      toast.error(backendMessage);
    }
  };

  const saveOffice = async () => {
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
        toast.success(response.data.message);
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
    try {
      const response = await apiClient.post(`/lead/add-lead-contact/${userId}`, {
        lead_id: leadId,
        ...contactForm,
      });

      if (response.data.success) {
        setContacts([...contacts, contactForm]);
        setContactForm({
          name: '',
          phone: '',
          alt_phone: '',
          email: '',
        });
         toast.success(response.data.message);
      } else {
        console.error('Invalid save contact response:', response.data);
      }
    } catch (error) {
      const backendMessage = error.response.data.message;
      toast.error(backendMessage);
      console.error('Failed to save contact:', error);
    }
  };

  return (
    <div className="new-lead-container">
      <h2>Create New Lead</h2>

      {/* STEP 1 - COMPANY FORM */}
      {!leadId && (
        <div>
          <h3>Step 1: Company Info</h3>
          <input
            type="text"
            placeholder="Company Name"
            value={companyForm.company_name}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, company_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Product"
            value={companyForm.product}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, product: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Industry Type"
            value={companyForm.industry_type}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, industry_type: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Export Value"
            value={companyForm.export_value}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, export_value: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Insured Amount"
            value={companyForm.insured_amount}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, insured_amount: e.target.value })
            }
          />
          <button onClick={createLead}>Save & Continue to Offices</button>
        </div>
      )}

      {/* STEP 2 - OFFICE FORM */}
      {leadId && (
        <div>
          <h3>Step 2: Office Details</h3>
          <input
            type="text"
            placeholder="Address"
            value={officeForm.address}
            onChange={(e) =>
              setOfficeForm({ ...officeForm, address: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="City"
            value={officeForm.city}
            onChange={(e) =>
              setOfficeForm({ ...officeForm, city: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="District"
            value={officeForm.district}
            onChange={(e) =>
              setOfficeForm({ ...officeForm, district: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Country"
            value={officeForm.country}
            onChange={(e) =>
              setOfficeForm({ ...officeForm, country: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={officeForm.postal_code}
            onChange={(e) =>
              setOfficeForm({ ...officeForm, postal_code: e.target.value })
            }
          />
          <button onClick={saveOffice}>Save Office</button>

          {officeSaved && (
            <button onClick={() => setOfficeSaved(false)}>
              Add Another Office
            </button>
          )}
        </div>
      )}

      {/* STEP 3 - CONTACT FORM */}
      {leadId && officeSaved && (
        <div>
          <h3>Step 3: Contact Details</h3>
          <input
            type="text"
            placeholder="Name"
            value={contactForm.name}
            onChange={(e) =>
              setContactForm({ ...contactForm, name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Phone"
            value={contactForm.phone}
            onChange={(e) =>
              setContactForm({ ...contactForm, phone: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Alt Phone"
            value={contactForm.alt_phone}
            onChange={(e) =>
              setContactForm({ ...contactForm, alt_phone: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={contactForm.email}
            onChange={(e) =>
              setContactForm({ ...contactForm, email: e.target.value })
            }
          />
          <button onClick={saveContact}>Save Contact</button>

          <button onClick={() => {}}>
            Add Another Contact
          </button>
        </div>
      )}

      {/* Summary */}
      {leadId && (
        <div style={{ marginTop: '20px' }}>
          <h4>Summary:</h4>
          <p>Lead ID: {leadId}</p>
          <p>Offices Added: {offices.length}</p>
          <p>Contacts Added: {contacts.length}</p>
        </div>
      )}
    </div>
  );
};

export default LeadsNewPage;
